/// <reference types="react-scripts" />
declare type MovieInfo = {
  directors: string[];
  first_air_date: string;
  genre_ids: number[];
  genres: { id: number; name: string }[];
  id: number;
  imdbId: string;
  overview: string;
  original_name: string;
  original_title: string;
  poster_path: string | null;
  imdbRating: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  title?: string;
  media_type: string;
};

declare type Trending = {
  page: number;
  results: [MovieInfo];
  total_pages: number;
  total_results: number;
};

declare type SearchResults = {
  results: [MovieInfo];
  total_pages: number;
};