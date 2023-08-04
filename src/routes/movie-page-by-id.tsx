import { useParams,useLocation } from "react-router-dom";
import { getTVDetailsByTmdbId,getMovieDetailsByTmdbId,getDirectors,getIMDBRating } from "../requests/common";
import { useState,useEffect } from "react";
import {SingleMoviePage} from "../components/single-movie-page"



export const MoviePageById = () => {
  const id = String(useParams().id);
  const movieOrTV = useLocation().pathname.includes("movie") ? "movie" : "tv";
  const movieOrTVShouldBeFetched =
    movieOrTV === "tv" ? getTVDetailsByTmdbId : getMovieDetailsByTmdbId;
  const [movieDetails, setMovieDetails]: [MovieInfo | undefined, any] =
    useState();
  useEffect(() => {
    movieOrTVShouldBeFetched(id).then((movieData) => {
      console.log("movieData", movieData);
      if (movieData.length === 0) setMovieDetails(undefined);
      else {
        Promise.all([
          getDirectors(id, movieOrTV),
          getIMDBRating(movieData.imdb_id),
        ]).then(([directors, imdb_rating]) => {
          setMovieDetails(
            Object.assign(
              movieData,
              //prettier-ignore
              directors.length
                ? { directors: directors.map(({ name }: { name: string }) => name ),}
                : {},
              { imdbId: movieData.imdb_id, imdbRating: imdb_rating },
              {
                genre_ids: movieData.genres.map(
                  (genre: { id: string }) => genre.id
                ),
              }
            )
          );
        });
      }
    });
  }, []);
  if (movieDetails)
    return <SingleMoviePage {...movieDetails} media_type={movieOrTV} />;
  else return <></>;
};