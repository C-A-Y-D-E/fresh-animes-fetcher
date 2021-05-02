const fastify = require("fastify")();
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: "./config.env" });
fastify.register(require("fastify-cors"), {
  // put your options here
});
fastify.register(require("fastify-rate-limit"), {
  max: 100,
  timeWindow: 60 * 60 * 1000,
});
fastify.register(
  require("fastify-helmet")
  // Example disables the `contentSecurityPolicy` middleware but keeps the rest.
  // { contentSecurityPolicy: false }
);

fastify.register(require("./utils/auth"));
fastify.register(require("fastify-cookie"), {
  secret: process.env.JWT_SECRECT, // for cookies signature
  parseOptions: {}, // options for parsing cookies
});
fastify.register(require("./utils/DbConnect"));
fastify.register(require("fastify-sensible"));
fastify.register(require("fastify-compress"));
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/public/", // optional: default '/'
});

fastify.register(require("./routes/animes"), { prefix: "/api/v1/" });
fastify.register(require("./routes/user"));
fastify.get("/", (req, reply) => {
  return reply.sendFile("documentation.html");
});

const port = process.env.PORT || 5000;
fastify.listen(port, "0.0.0.0", (err) => {
  if (err) throw err;
  const port = fastify.server.address().port;
  console.log(`server listening on ${port}`);
});
