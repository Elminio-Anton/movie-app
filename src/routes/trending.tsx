import { useState, useRef, MouseEventHandler, useEffect, Fragment } from "react";
import ReactLoading from "react-loading";
import { useParams, useSearchParams } from "react-router-dom";
import { Pagination } from "../components/pagination";
import { getTrending } from "../requests/common";
import { SmallTMDBObjectInfo } from "../components/small-tmdb-object-info";

export function Trending() {
  let params = useParams();
  let speed: number = 1;
  let [searchParams, setSearchParams] = useSearchParams();
  let [loading, setLoading] = useState(true);
  let [previousX, setPreviousX]: [number | null, any] = useState(null);
  let [trendingMovies, setTrendingMovies]: [Trending | undefined, any] =
    useState();
  let [activeDragScroll, setactiveDragScroll]: [true | false, any] =
    useState(false);
  let trendingRef = useRef<HTMLDivElement | null>(null);

  let mouseMoveHandler: MouseEventHandler = (event) => {
    if (activeDragScroll) {
      event.preventDefault();
      if (trendingRef.current) {
        trendingRef.current.scrollLeft =
          trendingRef.current.scrollLeft +
          ((previousX ?? 0) - event.clientX) * speed;
        setPreviousX(event.clientX);
      }
    }
  };

  let mouseDownHandler: MouseEventHandler = (event) => {
    event.preventDefault();
    setactiveDragScroll(true);
    setPreviousX(event.clientX);
  };

  let mouseUpHandler: MouseEventHandler = (event) => {
    setactiveDragScroll(false);
  };

  let mouseLeaveHandler: MouseEventHandler = (event) => {
    setactiveDragScroll(false);
  };

  useEffect(() => {
    getTrending(
      searchParams.get("type"),
      searchParams.get("period"),
      String(params.page ? params.page : "1")
    ).then((response) => {
      if (response) {
        setTrendingMovies({
          ...response,
          total_pages: response.total_pages <= 500 ? response.total_pages : 500,
        });
        setLoading(false);
      }
    });
  }, [searchParams, params]);

  return loading ? (
    <div className="loader-container">
      <ReactLoading
        type="spinningBubbles"
        color="#01b4e4"
        className="loader"
        height={200}
        width={200}
      />
    </div>
  ) : (
    <Fragment>
      <div
        className={`popular-movies-container ${
          activeDragScroll ? "active-drag-scroll" : ""
        }`}
        ref={trendingRef}
        onMouseDown={mouseDownHandler}
        onMouseLeave={mouseLeaveHandler}
        onMouseUp={mouseUpHandler}
        onMouseMove={mouseMoveHandler}>
        {trendingMovies &&
          trendingMovies.results.map((movie) => (
            <SmallTMDBObjectInfo
              posterPath={movie.poster_path}
              originalTitle={movie.original_title || movie.original_name}
              key={movie.id}
              genre_ids={movie.genre_ids}
              tmdbRating={Math.round(movie.vote_average * 10) / 10 || 0}
              releaseDate={new Date(movie.release_date || movie.first_air_date)}
              movieId={movie.id}
              media_type={movie.media_type}
            />
          ))}
      </div>
      <Pagination
        pages={Number(trendingMovies && trendingMovies.total_pages)}
        activePage={Number(params.page) || 1}
        route="trending"
      />
    </Fragment>
  );
}
