import { useState, useEffect, Fragment } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Pagination } from "../components/pagination";
import { SmallTMDBObjectInfo } from "../components/small-tmdb-object-info";
import { getSearchResults } from "../requests/common";

export const SearchResults = () => {
  let { page } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();
  let [searchResults, setSearchResults]: [SearchResults | undefined, any] =
    useState();

  useEffect(() => {
    if (searchParams.get("search")) {
      getSearchResults(
        String(searchParams.get("search")),
        parseInt(page || "1")
      ).then(setSearchResults);
    }
  }, [searchParams, page]);
  return (
    <Fragment>
      <div className="popular-movies-container">
        {searchResults &&
          searchResults.results.map((movie) => (
            <SmallTMDBObjectInfo
              posterPath={movie.poster_path}
              originalTitle={movie.original_title || movie.original_name}
              key={movie.id}
              genre_ids={movie.genres.map(({ id }) => id)}
              tmdbRating={movie.vote_average}
              releaseDate={new Date(movie.release_date || movie.first_air_date)}
              movieId={movie.id}
              media_type={movie.media_type}
            />
          ))}
      </div>
      <Pagination
        pages={(searchResults && searchResults.total_pages) || 1}
        activePage={parseInt(page || "1")}
        route="search"
      />
    </Fragment>
  );
};