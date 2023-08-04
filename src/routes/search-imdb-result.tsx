import { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import { useParams } from "react-router-dom";
import { SingleMoviePage } from "../components/single-movie-page";
import { loadingColor } from "../constants";
import { getMovieDetailsByImdbId, getDirectors, getIMDBRating } from "../requests/common";

export const SearchIMDBResult = ()=>{
  let params = useParams();
  let [ready, setReady] = useState(false);
  let [movieDetails, setMovieDetails]: [MovieInfo | undefined, any] =
    useState();
  let [fullId, setFullId] = useState("");
  useEffect(() => {
    getMovieDetailsByImdbId(String(params.imdbId)).then((movieData) => {
      if (movieData.movie_results.length === 0) setMovieDetails(undefined);
      else {
        Promise.all([
          getDirectors(
            movieData.movie_results[0].id,
            movieData.media_type || "movie"
          ),
          getIMDBRating(String(params.imdbId)),
        ]).then((result) => {
          setMovieDetails(
            Object.assign(
              movieData.movie_results[0],
              //prettier-ignore
              result[0]
                ? { directors: result[0].map(({ name }: { name: string }) => name ),}
                : {},
              { imdbId: params.imdbId, imdbRating: result[1] },
              {}
            )
          );
          setReady(true);
        });
      }
    });
  }, [fullId]);

  useEffect(() => {
    if (params.imdbId && params.imdbId.length >= 7)
      if (
        fullId === params.imdbId &&
        movieDetails &&
        movieDetails.original_title !== "unknown"
      )
        setReady(true);
      else {
        setFullId(params.imdbId);
        setReady(false);
      }
    else if (ready && params.imdbId && params.imdbId.length < 7)
      setReady(false);
  }, [params.imdbId]);

  if (ready && params.imdbId && params.imdbId.length >= 7 && movieDetails)
    return <SingleMoviePage {...movieDetails} />;
  else
    return (
      <div className="loader-container">
        <ReactLoading
          type="spinningBubbles"
          color={loadingColor}
          className="loader"
          height={200}
          width={200}
        />
      </div>
    );
}