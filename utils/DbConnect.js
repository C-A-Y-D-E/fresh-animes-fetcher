const fastifyPlugin = require("fastify-plugin");
const mongoose = require("mongoose");
// Connect to DB
async function dbConnector(fastify, options) {
  try {
    const url = process.env.MONGODB_URI;
    const db = await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("Database is connected");
    fastify.decorate("mongo", db);
  } catch (err) {
    console.log(err);
  }
}
module.exports = fastifyPlugin(dbConnector);
