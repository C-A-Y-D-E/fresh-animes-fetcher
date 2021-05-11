const {
  getAnimes,
  getAnime,
  getAnimeEpisode,
  getAnimeGenres,
  getAnimeReleases,
} = require("../controllers/AnimeController");

async function routes(fastify, options) {
  fastify.get("/animes", getAnimes(fastify));
  fastify.get("/anime/:id", getAnime(fastify));
  fastify.get("/anime/:id/episode/:episodeNo", getAnimeEpisode(fastify));
  fastify.get("/animes/genres", getAnimeGenres);
  fastify.get("/animes/releases", getAnimeReleases);
}

module.exports = routes;
