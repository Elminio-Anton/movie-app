import {SmallestTMDBObjectInfo} from "./smallest-tmdb-object-info"
import { useLayoutEffect,useState } from "react";
import { getRecommended,getSimilar } from "../requests/common";
import ReactLoading from "react-loading"
import {loadingColor} from "../constants"
import noImage from "../img/no-image-icon.png";
import { IMDBRating } from "./imdb-rating";
import { TMDBRating } from "./tmdb-rating";
import { genres } from "../state/genres";


export const SingleMoviePage = (movieDetails: MovieInfo) => {
  console.dir("SingleMoviePage", movieDetails);
  let [recommendedMovies, setRecommendedMovies]: [MovieInfo[], any] = useState(
    []
  );
  let [similarMovies, setSimilarMovies]: [MovieInfo[], any] = useState([]);
  let [loading, setLoading]: [boolean, any] = useState(true);
  useLayoutEffect(() => {
    Promise.all([
      getRecommended(movieDetails.id, 1, movieDetails.media_type),
      getSimilar(movieDetails.id, 1, movieDetails.media_type),
    ]).then((responses) => {
      setRecommendedMovies(responses[0].results);
      setSimilarMovies(responses[1].results);
      setLoading(false);
    });
  }, []);
  if (loading)
    return (
      <div className="loader-container">
        <ReactLoading
          type="spinningBubbles"
          color={loadingColor}
          className="loader"
          height={200}
          width={200}
          delay={0}
        />
      </div>
    );
  else
    return (
      <div className="single-movie-page">
        <div className="short-info-container">
          <img
            className="poster"
            src={
              movieDetails.poster_path
                ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${movieDetails.poster_path}`
                : noImage
            }
            alt={movieDetails.original_title || "poster"}
            srcSet={
              movieDetails.poster_path
                ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${movieDetails.poster_path} 1x, https://www.themoviedb.org/t/p/w600_and_h900_bestv2${movieDetails.poster_path} 2x`
                : noImage
            }
          />
          <div className="short-info">
            <p className="title">Title: {movieDetails.original_title}</p>
            <div className="ratings-container">
              <IMDBRating
                imdbRating={movieDetails.imdbRating}
                title={movieDetails.original_title}
                imdbId={movieDetails.imdbId}
              />
              <TMDBRating
                rating={Math.trunc(movieDetails.vote_average * 10) / 10}
              />
            </div>
          </div>
        </div>
        <div className="movie-description">
          <p className="overview">{movieDetails.overview}</p>
          <div className="minor-info">
            <p className="genres">
              Genres:{" "}
              {movieDetails.genre_ids
                .map((id) => genres.getByIds([id]))
                .join(" ")}
            </p>
            {movieDetails.directors ? (
              <span className="directors">
                {movieDetails.directors.length > 1 ? "Directors:" : "Director:"}{" "}
                {movieDetails.directors.join(", ")}
              </span>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="similar-movies-container">
          <h5 className="h5">Similar movies</h5>
          <div className="scroll-wrapper">
            <div className="similar-movies">
              {similarMovies.map((movieInfo: MovieInfo, i) => (
                <SmallestTMDBObjectInfo movieInfo={movieInfo} key={i} />
              ))}
            </div>
          </div>
        </div>
        <div className="recommended-movies-container">
          <h5 className="h5">Recommended movies</h5>
          <div className="scroll-wrapper">
            <div className="recommended-movies">
              {recommendedMovies.map((movieInfo: MovieInfo, i) => (
                <SmallestTMDBObjectInfo movieInfo={movieInfo} key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
};