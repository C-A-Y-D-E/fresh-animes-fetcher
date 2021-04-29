const fastify = require("fastify")();
const dotenv = require("dotenv");
const path = require("path");
const Anime = require("./models/animeModel");
dotenv.config({ path: "./config.env" });

fastify.register(require("./utils/DbConnect"));

fastify.register(require("./routes/animes"), { prefix: "/api/v1/" });

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/public/", // optional: default '/'
});

fastify.get("/", (req, reply) => {
  return reply.sendFile("documentation.html");
});

fastify.listen(process.env.PORT, (err) => {
  if (err) throw err;
  const port = fastify.server.address().port;
  console.log(`server listening on ${port}`);
});
