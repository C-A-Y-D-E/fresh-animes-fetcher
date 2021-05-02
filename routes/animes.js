const {
  getAnimes,
  getAnime,
  getAnimeEpisode,
} = require("../controllers/AnimeController");

async function routes(fastify, options) {
  fastify.get("/animes", getAnimes(fastify));
  fastify.get("/anime/:id", getAnime(fastify));

  fastify.get("/anime/:id/episode/:episodeId", getAnimeEpisode(fastify));
}

module.exports = routes;
