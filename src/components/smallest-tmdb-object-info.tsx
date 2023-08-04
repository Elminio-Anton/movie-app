import { homePage } from "../constants";


export const SmallestTMDBObjectInfo = ({ movieInfo }: { movieInfo: MovieInfo }) => {
  return (
    <a className="smallest" href={`${homePage}/movie/${movieInfo.id}`}>
      <img
        className="poster"
        src={`https://www.themoviedb.org/t/p/w250_and_h141_face/${movieInfo.poster_path}`}
        alt={movieInfo.original_title}
      />
      <span className="title">
        {movieInfo.title || movieInfo.original_title}
      </span>
    </a>
  );
};