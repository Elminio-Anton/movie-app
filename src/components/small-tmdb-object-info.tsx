import { Fragment } from "react";
import { homePage } from "../constants";
import { genres } from "../state/genres";
import noImage from "../img/no-image-icon.png";

export const SmallTMDBObjectInfo = ({
  posterPath,
  originalTitle,
  genre_ids,
  tmdbRating,
  releaseDate,
  movieId,
  width = 170,
  height = 466,
  media_type,
}: {
  posterPath: string | null;
  originalTitle: string;
  genre_ids: number[];
  tmdbRating: number;
  releaseDate: Date;
  movieId: number;
  width?: number;
  height?: number;
  media_type: string;
}) => {
  let ratingColor =
    tmdbRating === 0
      ? "rgb(128,128,128)"
      : tmdbRating <= 4
      ? "rgb(255,0,0)"
      : tmdbRating <= 5
      ? "rgb(255,165,0)"
      : `rgb(0,${100 + Math.round((tmdbRating - 5) * 20)},0)`;
  let ratingStyle = {
    color: `#0d253f`,
    background: `radial-gradient(circle, #90cea1 0%, #90cea1 30%, ${ratingColor} 65%)`,
  };
  let smallInfoStyle = {
    width: `${width}px`,
    height: `${height}px`,
  };
  const optimizedGenres = (genre_ids: number[]) => {
    if (!genre_ids) return null;
    if (
      genres
        .getByIds(genre_ids)
        .reduce((length, genre) => length + genre.length, 0) <= 20
    )
      return genres
        .getByIds(genre_ids)
        .sort((a, b) => a.length - b.length)
        .map((genre, i) => (
          <div className="genre" key={i}>
            {genre}
          </div>
        ));
    else {
      let genres_names = genres
        .getByIds(genre_ids)
        .sort((a, b) => a.length - b.length);
      let sliced =
        genres_names[0].length + genres_names[1].length <= 15
          ? { visible: genres_names.slice(0, 2), hidden: genres_names.slice(2) }
          : {
              visible: genres_names.slice(0, 1),
              hidden: genres_names.slice(1),
            };

      return (
        <Fragment>
          {sliced.visible.map((genre, i) => (
            <div className="genre" key={i}>
              {genre}
            </div>
          ))}
          <span title={sliced.hidden.join(" ")}>
            {" "}
            and {sliced.hidden.length + " "}
            <span className="hidden-genres">more...</span>
          </span>
        </Fragment>
      );
    }
  };

  return (
    <div className="small-info" style={smallInfoStyle}>
      <a
        className="poster-container"
        href={`${homePage}/${media_type || "movie"}/${movieId}`}>
        <img
          className="poster"
          src={
            posterPath
              ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${posterPath}`
              : noImage
          }
          alt="poster"
          dataset-movieid={movieId}></img>
      </a>
      <div className="original-title-container">
        <span className="heading">Original title:</span>
        <span className="original-title">{originalTitle}</span>
      </div>
      <div className="genres">
        <span className="heading">Genres:</span>
        <div className="genres-container">
          {optimizedGenres(genre_ids) ?? "no genres"}
        </div>
      </div>
      <div className="release-date">
        <span className="heading">Release date:</span>
        <span>
          {releaseDate.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <div style={ratingStyle} className="rating">
        {tmdbRating}
      </div>
    </div>
  );
};
