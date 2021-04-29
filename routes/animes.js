const slug = require("slug");
const x = require("x-ray-scraper");
const Anime = require("../models/animeModel");
async function routes(fastify, options) {
  // const collection = fastify.mongo.db.collection("animes");

  fastify.get("/animes", async (request, reply) => {
    const animes = await Anime.find({}).sort({ updatedAt: -1 }).limit(10);

    return animes;
  });

  fastify.get("/anime/:id", async (request, reply) => {
    const anime = await Anime.findOne({
      _id: request.params.id,
    });
    if (!anime) {
      reply.status(404).send({
        status: "fail",
        message: "Anime Not Available with this id",
      });
    }

    return anime;
  });

  fastify.get("/anime/:id/episode/:episodeId", async (request, reply) => {
    const anime = await Anime.findOne({
      _id: request.params.id,
    });

    if (parseInt(request.params.episodeId) > anime.totalEpisodes) {
      reply.status(404).send({
        status: "fail",
        message: "Episode Not available",
      });
    }

    let link = `https://gogoanime.ai/${slug(anime.title)}-episode-${
      request.params.episodeId
    }`;
    const episodeLink = await x(
      link,
      x(
        "#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > div.anime_video_body_cate > div.favorites_book > ul > li.dowloads > a@href",
        ["#main > div > div.content_c > div > div:nth-child(5) a@href"]
      )
    );

    return episodeLink;
  });

  fastify.get("/animes/:query", async (request, reply) => {
    const animes = await Anime.find({
      $text: {
        $search: request.params.query,
      },
    });

    if (!animes) {
      return reply.status(404).send({
        status: "fail",
        message: "No Anime with this name",
      });
    }
    return animes;
  });
}

module.exports = routes;
