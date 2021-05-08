const slug = require("slug");
const x = require("x-ray-scraper");
const Anime = require("../models/animeModel");
const ApiFeatures = require("../utils/ApiFeatures");

/**
 *
 * All Animes
 */
exports.getAnimes = (fastify) => async (request, reply) => {
  let filter = {};

  if (request.query.genre) {
    const genre = request.query.genre
      .split(",")
      .map((value) => new RegExp("^" + value + "$", "i"));

    filter.genre = { $all: genre };
  }

  if (request.query.type) {
    if (request.query.type === "popular") {
      const titles = await x(
        "https://myanimelist.net/topanime.php?type=bypopularity",
        ".ranking-list",
        ["h3"]
      );
      // const all = titles.map((value) => new RegExp("^" + value + "$", "i"));

      filter.title = { $in: titles };
    } else {
      filter.type = { $regex: `${request.query.type}`, $options: "i" };
    }
  }

  const features = new ApiFeatures(Anime.find(filter, {}), request.query)
    .search()
    .sort()
    .fields()
    .paginate();

  const docs = await features.query;
  if (!docs.length > 0) {
    return reply.code(200).send({
      status: "success",
      data: null,
    });
  }
  const page = request.query.page ? parseInt(request.query.page) : 1;
  const limit = request.query.limit ? parseInt(request.query.limit) : 10;
  const count = Math.ceil((await Anime.countDocuments(filter)) / limit);

  return reply.code(200).send({
    status: "success",
    total: docs.length,
    totalPage: count,
    page,
    data: docs,
  });
};

/**
 *
 * Single Anime
 */

exports.getAnime = (fastify) => async (request, reply) => {
  const anime = await Anime.findOne({
    _id: request.params.id,
  });
  if (!anime) {
    reply.notFound("Anime Not Available with this id");
  }

  return reply.code(200).send({
    status: "success",
    data: anime,
  });
};

/**
 *
 * Get Episode
 */

exports.getAnimeEpisode = (fastify) => async (request, reply) => {
  const anime = await Anime.findOne({
    _id: request.params.id,
  });

  if (parseInt(request.params.episodeId) > anime.totalEpisodes) {
    reply.notFound("Episode Not available");
  }

  const animeTitle = anime?.title.replace(".", " ");

  let link = `https://gogoanime.ai/${slug(animeTitle)}-episode-${
    request.params.episodeId
  }`;

  let episodeLink = await x(
    link,
    x(
      "#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > div.anime_video_body_cate > div.favorites_book > ul > li.dowloads > a@href",
      ["#main > div > div.content_c > div > div:nth-child(5) a@href"]
    )
  );

  if (episodeLink?.length === 0) {
    episodeLink = await x(
      `${link}-${request.params.episodeId}`,
      x(
        "#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > div.anime_video_body_cate > div.favorites_book > ul > li.dowloads > a@href",
        ["#main > div > div.content_c > div > div:nth-child(5) a@href"]
      )
    );
  }

  if (episodeLink?.length === 0) {
    reply.notFound("Not available to find episode link");
  }

  return reply.code(200).send({
    status: "success",
    data: episodeLink,
  });
};
