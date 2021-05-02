const slug = require("slug");
const x = require("x-ray-scraper");
const Anime = require("../models/animeModel");
const ApiFeatures = require("../utils/ApiFeatures");
exports.getAnimes = (fastify) => async (request, reply) => {
  let filter = {};

  if (request.query.genre) {
    const genre = request.query.genre
      .split(",")
      .map((value) => new RegExp("^" + value + "$", "i"));

    filter = { genre: { $all: genre } };
  }
  const features = new ApiFeatures(Anime.find(filter), request.query)
    .search()
    .sort()
    .fields()
    .paginate();

  const doc = await features.query;
  if (!doc.length > 0) {
    return reply.code(200).send({
      status: "success",
      data: null,
    });
  }

  return reply.code(200).send({
    status: "success",
    total: doc.length,
    page: request.query.page ? parseInt(request.query.page) : 1,
    data: doc,
  });
};

exports.getAnime = (fastify) => async (request, reply) => {
  const anime = await Anime.findOne({
    _id: request.params.id,
  });
  if (!anime) {
    reply.notFound("Anime Not Available with this id");
  }

  return anime;
};

exports.getAnimeEpisode = (fastify) => async (request, reply) => {
  const anime = await Anime.findOne({
    _id: request.params.id,
  });

  if (parseInt(request.params.episodeId) > anime.totalEpisodes) {
    reply.notFound("Episode Not available");
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
};
