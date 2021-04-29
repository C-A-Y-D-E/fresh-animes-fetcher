// const fastifyPlugin = require("fastify-plugin");

// async function dbConnector(fastify, options) {
//   // fastify.register(require("fastify-mongodb"), {
//   //   url: process.env.MONGODB_URI,
//   //   forceClose: true,
//   // });

// }

// // Wrapping a plugin function with fastify-plugin exposes the decorators
// // and hooks, declared inside the plugin to the parent scope.
// module.exports = fastifyPlugin(dbConnector);

const fastifyPlugin = require("fastify-plugin");
const mongoose = require("mongoose");
// Connect to DB
async function dbConnector(fastify, options) {
  try {
    const url = process.env.MONGODB_URI;
    const db = await mongoose.connect(url, {
      useNewUrlParser: true,
    });
    console.log("Database is connected");
    fastify.decorate("mongo", db);
  } catch (err) {
    console.log(err);
  }
}
module.exports = fastifyPlugin(dbConnector);
