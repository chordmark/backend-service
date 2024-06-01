import mongoose from 'mongoose';

const SuggestSchema = new mongoose.Schema({
  suggest: {
    type: String,
    required: true,
    unique: true,
  },
  results: {
    type: [String],
    required: true,
  },
});

export const Suggest = mongoose.model('Suggest', SuggestSchema);

const SearchResult = new mongoose.Schema({
  artist: { type: String, required: true },
  shortId: { type: String, required: true },
  song: { type: String, required: true },
  type: { type: String, required: true },
});

const SearchSchema = new mongoose.Schema({
  search: {
    type: String,
    required: true,
    unique: true,
  },
  results: {
    type: [SearchResult],
    required: true,
  },
});

export const Search = mongoose.model('Search', SearchSchema);

const HrefSchema = new mongoose.Schema({
  href: {
    type: String,
    required: true,
    unique: true,
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
});

export const Href = mongoose.model('Href', HrefSchema);

const MusicSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  song: {
    type: String,
    required: true,
  },
});

export const Music = mongoose.model('Music', MusicSchema);

module.exports = { Search, Suggest, Href, Music };
