const mongoose = require("mongoose");
const animeSchema = mongoose.Schema(
  {
    title: String,
    type: String,
    summary: String,
    genre: [String],
    released: String,
    status: String,
    otherName: [String],
    animeID: String,
    totalEpisodes: Number,
    image: String,
    slug: String,
    category: String,
    episodes: [{ episodeNo: Number, link: String }],
  },
  { timestamps: true }
);

module.exports = Anime = mongoose.model("anime", animeSchema);
