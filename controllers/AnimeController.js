const slug = require("slug");
const x = require("x-ray-scraper");
const fetch = require("node-fetch");
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

  if (request.query.category) {
    if (request.query.category === "popular") {
      const titles = await x(
        "https://myanimelist.net/topanime.php?type=bypopularity",
        ".ranking-list",
        ["h3"]
      );
      // const all = titles.map((value) => new RegExp("^" + value + "$", "i"));

      filter.title = { $in: titles };
    } else {
      filter.category = { $regex: `${request.query.category}`, $options: "i" };
    }
  }

  if (request.query.released) {
    filter.released = request.query.released;
  }

  const features = new ApiFeatures(
    Anime.find(filter, {}).select("-episodes"),
    request.query
  )
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
  }).lean();
  console.log(anime);
  if (!anime) reply.notFound("No Anime Found");
  const episodeID = parseInt(request.params.episodeNo);
  if (episodeID > anime.totalEpisodes) {
    reply.notFound("Episode Not available");
  }

  let link = `${process.env.GOGO_URI}${anime?.episodes[episodeID - 1]?.link}`;

  let url = await x(
    link,
    "#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > div.anime_video_body_cate > div.favorites_book > ul > li.dowloads > a@href"
  );
  const id = url.split("?")[1].split("&")[0].split("=")[1];

  const res = await fetch(`${process.env.GOGO_PLAY}${id}`);

  const episodeLink = await res.json();

  if (!episodeLink) {
    reply.notFound("Not available to find episode link");
  }

  return reply.code(200).send({
    status: "success",
    data: episodeLink,
  });
};

exports.getAnimeGenres = async (request, reply) => {
  const genres = await Anime.distinct("genre");
  return reply.code(200).send({
    status: "success",
    data: genres,
  });
};
exports.getAnimeReleases = async (request, reply) => {
  const genres = await Anime.distinct("released");
  return reply.code(200).send({
    status: "success",
    data: genres,
  });
};
