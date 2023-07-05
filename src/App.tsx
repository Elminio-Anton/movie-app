import React, {
  lazy,
  ChangeEventHandler,
  Fragment,
  useEffect,
  useState,
  useRef,
  LegacyRef,
  MouseEventHandler,
  useLayoutEffect,
  RefObject,
} from "react";
import "./app.css";
import "./fonts.css";
import "./layout.css";
import ReactLoading from "react-loading";
import {
  getIMDBRating,
  getDirectors,
  getSearchResults,
  getTrending,
  getMovieDetailsByImdbId,
  createRequestToken,
  requestLogin,
  createSession,
  getAccountDetails,
  getGenres,
  fetchData,
  getMovieDetailsByTmdbId,
  getRecommended,
  getSimilar,
} from "../src/requests/common";
import {
  Link,
  Outlet,
  useNavigate,
  useLocation,
  useSearchParams,
  useParams,
  Navigate,
  NavLink,
} from "react-router-dom";
import { type } from "@testing-library/user-event/dist/type";
import { homePage } from "./constants";
import likeR from "./img/like-r.svg";
const loadingColor = "#64cde9";

/* const onAppend = (elem: Node, func: Function) => {
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.addedNodes.length) {
                func(m.addedNodes)
            }
        })
    })
    observer.observe(elem, { childList: true })
}

onAppend(document.body, (added: NodeList) => {
    console.log('!!!!!!', added)
    //debugger
    console.log(document.querySelector('[id^=imdb-jsonp]'))
    console.log(added[0].isEqualNode(document.querySelector('[id^=imdb-jsonp]')))
    if (added[0] === document.querySelector('[id^=imdb-jsonp]')) {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1');
        document.querySelector('[id^=imdb-jsonp]')?.setAttribute('async', 'async')
    }
}) */
type Trending = {
  page: number;
  results: [MovieInfo];
  total_pages: number;
  total_results: number;
};
type SearchResults = {
  results: [MovieInfo];
  total_pages: number;
};
type MovieInfo = {
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
};
const request_token = (() => {
  const local = window.localStorage;
  return {
    get: () => {
      return String(local.getItem("request_token"));
    },
    set: (token: string) => {
      local.setItem("request_token", token);
    },
    check: () => {
      return local.getItem("request_token") || false;
    },
  };
})();
const sessionId = (() => {
  const local = window.localStorage;
  return {
    get: () => {
      return String(local.getItem("session_id"));
    },
    set: (sessionId: string) => {
      return local.setItem("session_id", sessionId);
    },
    check: () => {
      return local.getItem("session_id") || false;
    },
  };
})();
let genres = (() => {
  let innerGenres: { id: number; name: string };
  return {
    set: (genres: { id: number; name: string }) => {
      innerGenres = genres;
    },
    getByIds: (genre_ids: number[]) =>
      Object.entries(innerGenres)
        .filter((genre) => genre_ids.some((id) => id === +genre[0]))
        .map((genre) => String(genre[1])),
    get: () => {
      return innerGenres;
    },
  };
})();
const localFavourites = (() => {
  let local = window.localStorage;
  return {
    check: (id: number) => {
      return (
        local.getItem("favourites") &&
        local.getItem("favourites")?.includes(`${id}`)
      );
    },
    add: (id: number) => {
      if (local.getItem("favourites") !== null)
        local.setItem("favourites", local.getItem("favourites") + " " + id);
      else local.setItem("favourites", String(id));
    },
    remove: (id: number) => {
      if (local.getItem("favourites") !== null)
        local.setItem(
          "favourites",
          (local.getItem("favourites") || "").replace(`${id}`, "")
        );
    },
  };
})();
getGenres().then((genresArr) => {
  //console.log('GENRES!!!!!', genres);
  genres.set(
    genresArr.genres.reduce(
      (newGenresObject: Object, genre: { id: number; name: string }) =>
        Object.assign(newGenresObject, { [genre.id]: genre.name }),
      {}
    )
  );
  //console.log('GENRES!!!!!', genres);
});

function LoginLogout() {
  let navigate = useNavigate();
  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  //console.log('searchParams', searchParams, typeof searchParams);
  //console.log('location', location.pathname, location.search);
  //debugger
  const initToken = (updateSession: Function, updateName: Function) => {
    if (searchParams.get("approved") === "true") {
      //console.log('params', searchParams)
      request_token.set(String(searchParams.get("request_token")));
      if (sessionId.check() === false)
        createSession(request_token.get()).then((session_id) => {
          sessionId.set(session_id);
          updateSession(sessionId.get());
          navigate(`${homePage}`, { replace: true });
          getAccountDetails(sessionId.get()).then((account) => {
            if (account) {
              updateName(account.username);
              updateSession(true);
            } else {
              localStorage.clear();
              updateSession(false);
            }
          });
        });
    } else if (sessionId.check()) {
      getAccountDetails(sessionId.get()).then((account) => {
        if (account) {
          updateName(account.username);
          updateSession(true);
        } else {
          localStorage.clear();
          updateSession(false);
        }
      });
    } else
      createRequestToken().then((token) => {
        request_token.set(token);
        //updateState(request_token.get())
      });
  };
  //const [token, setToken] = useState(request_token.get())
  const [sessionOn, setSession] = useState(false);
  const [accountName, setAccountName] = useState("noname");
  //console.log('token=', token)
  const redirectToLogin = () => {
    requestLogin(request_token.get());
  };
  const logOut = () => {
    localStorage.clear();
    setSession(false);
    navigate(`${homePage}`, { replace: true });
    //window.location.replace(HOME)
    initToken(setSession, setAccountName);
  };
  useEffect(() => {
    initToken(setSession, setAccountName);
  }, []);
  return sessionId.get() !== "null" ? (
    <div className="login-container">
      <span className="login-text">You are logged in as {accountName}</span>
      <button onClick={logOut} className="logout-button">
        Log out
      </button>
    </div>
  ) : (
    <div className="login-container">
      <button onClick={redirectToLogin} className="login-button">
        Log in
      </button>
    </div>
  );
  /*     if (sessionOn)
            return (
                <div className='login-container'>
                    <span className='login-text'>You are logged in as {accountName}</span>
                    <button onClick={logOut} className='logout-button'>Log out</button>
                </div>
            )
        else
            return (
                <div className='login-container'>
                    <button onClick={redirectToLogin} className='login-button'>Log in</button>
                </div>
            ) */
}
function FindByIMDBId() {
  //let [searchParams, setSearchParams] = useSearchParams()
  let inputId = useRef<HTMLInputElement>(null);
  let navigate = useNavigate();
  let params = useParams();
  const beginSearch: ChangeEventHandler<HTMLInputElement> = () => {
    if (inputId.current !== null) {
      inputId.current.value = //String(parseInt(event.currentTarget.value) || '')
        inputId.current.value
          .split("")
          .filter((number) => +number === +number)
          .join("");
      if (inputId.current.value === "") navigate(`${homePage}`);
      else navigate(`${homePage}/search_by_imdb_id/${inputId.current.value}`);
      //console.log('inputId.current.value', typeof inputId.current.value);
    }
    //params = target.value
  };
  //<button className='button-search-by-id' id='search-by-id' onClick={searchById}>Search</button>
  return (
    <Fragment>
      <div className="search-by-imdb-container">
        <label
          htmlFor="searchImdb"
          title="Should be 7 or 8 numbers long. You can find it in URL, for example: 0489270 in https://www.imdb.com/title/tt0489270/"
          className="imdb-search-label">
          Enter IMDB ID for movie:
        </label>
        <input
          id="searchImdb"
          ref={inputId}
          value={params.imdbId}
          maxLength={8}
          inputMode="numeric"
          type="text"
          name="movie-id"
          className="id-input"
          onChange={beginSearch}></input>
      </div>
    </Fragment>
  );
}
function SearchIMDBResult() {
  let params = useParams();
  let [ready, setReady] = useState(false);
  let [movieDetails, setMovieDetails]: [MovieInfo | undefined, any] =
    useState();
  let [fullId, setFullId] = useState("");
  useEffect(() => {
    getMovieDetailsByImdbId(String(params.imdbId)).then((movieData) => {
      //console.log('movieData', movieData)
      if (movieData.movie_results.length === 0) setMovieDetails(undefined);
      else {
        Promise.all([
          getDirectors(movieData.movie_results[0].id),
          getIMDBRating(String(params.imdbId)),
        ]).then((result) => {
          setMovieDetails(
            Object.assign(
              movieData.movie_results[0],
              //prettier-ignore
              result[0]
                ? { directors: result[0].map(({ name }: { name: string }) => name ),}
                : {},
              { imdbId: params.imdbId, imdbRating: result[1] }
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
const Pagination = ({
  pages,
  activePage,
  route,
}: {
  pages: number;
  activePage: number;
  route: string;
}) => {
  let [searchParams, setSearchParams] = useSearchParams();
  /* if (!searchParams.get('period')) {
        searchParams.set('period', 'week')
        searchParams.set('type', 'movie')
    } */
  const PaginationButton = ({ page }: { page: string }) => {
    return (
      <NavLink
        to={`${homePage}/${route}/${page}?${searchParams}`}
        className={({ isActive }) =>
          `pagination-link ${
            isActive ? "active-pagination" : "inactive-pagination"
          }`
        }>
        {" "}
        {`${page}`}
      </NavLink>
    );
  };
  const getNearestIntegersAndDots = (
    currentNumber: number = 1,
    amountOfNumbersToReturn_odd: number = 1,
    totalNumbers: number = 1
  ) => {
    let amountOfNumbers =
      amountOfNumbersToReturn_odd % 2
        ? amountOfNumbersToReturn_odd
        : amountOfNumbersToReturn_odd - 1;
    let numbersArr: (number | string)[] = [currentNumber];
    if (amountOfNumbersToReturn_odd >= totalNumbers)
      numbersArr = [...new Array(amountOfNumbers)].map((_, i) => i + 1);
    else if (currentNumber - ((amountOfNumbers - 1) / 2 + 1) <= 0) {
      numbersArr = [...new Array(amountOfNumbers - 1)].map((_, i) => i + 1);
      numbersArr.push("...", totalNumbers);
    } else if (currentNumber + (amountOfNumbers - 1) / 2 + 1 > totalNumbers) {
      numbersArr = [...new Array(totalNumbers)]
        .map((_, i) => i + 1)
        .slice(-amountOfNumbers + 1);
      numbersArr.unshift(1, "...");
    } else {
      for (let i = Math.trunc((amountOfNumbers - 3) / 2); i >= 1; i--) {
        numbersArr.push(currentNumber - i);
        numbersArr.push(currentNumber + i);
      }
      numbersArr.sort((a, b) => +a - +b);
      numbersArr.unshift(1, "...");
      numbersArr.push("...", totalNumbers);
    }
    return numbersArr;
  };
  return (
    <ul className="pagination-list">
      {getNearestIntegersAndDots(activePage, 7, pages).map(
        (page_number, id) => {
          if (page_number === "...")
            return (
              <span className="dots" key={-id}>
                ...
              </span>
            );
          else
            return (
              <li
                className="navlink-container"
                key={page_number}
                style={{ width: `${String(page_number).length * 15 + 10}px` }}>
                <PaginationButton page={`${page_number}`}></PaginationButton>
              </li>
            );
        }
      )}
    </ul>
  );
};
function Trending() {
  let params = useParams();
  let speed: number = 1;
  let [searchParams, setSearchParams] = useSearchParams();
  let [loading, setLoading] = useState(true);
  let [previousX, setPreviousX]: [number | null, any] = useState(null);
  let [trendingMovies, setTrendingMovies]: [Trending | undefined, any] =
    useState();
  let [activeDragScroll, setactiveDragScroll]: [true | false, any] =
    useState(false);
  let trendingRef = useRef<HTMLDivElement>(null);
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
      //console.log('getTrending!!!!!');
      if (response) {
        setTrendingMovies(response);
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
              posterPath={movie.poster_path || "no poster path"}
              originalTitle={movie.original_title || movie.original_name}
              key={movie.id}
              genre_ids={movie.genre_ids}
              tmdbRating={Math.round(movie.vote_average * 10) / 10}
              releaseDate={new Date(movie.release_date || movie.first_air_date)}
              movieId={movie.id}
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
const IMDBRating = ({
  imdbRating,
  title,
  imdbId,
}: {
  imdbRating: string;
  title: string;
  imdbId: string;
}) => {
  return (
    <span className="imdbRating">
      <a href={`https://www.imdb.com/title/tt${imdbId}/?ref_=plg_rt_1`}>
        <img
          src="https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/images/imdb_46x22.png"
          alt={` ${title} on IMDb`}
        />
      </a>
      <span className="rating">
        {imdbRating}
        <span className="ofTen">/10</span>
      </span>
      <img
        src="https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/images/imdb_star_22x21.png"
        className="star"
      />
    </span>
  );
};
const TMDBRating = ({ rating }: { rating: number }) => {
  return (
    <div className="tmdb-rating">
      <div className="logo">TMDB</div>
      <span>
        <span className="rating">{rating}</span>
        <span className="ofTen">/10</span>
      </span>
    </div>
  );
};

const FilterTrending = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeSelect = useRef<HTMLSelectElement>(null);
  const periodSelect = useRef<HTMLSelectElement>(null);
  /*     let defaultType = 'movie';
        let defaultPeriod = 'week';
        useEffect(() => {
            defaultType = String(searchParams.get('type') ? searchParams.get('type') : 'movie')
            defaultPeriod = String(searchParams.get('period') ? searchParams.get('period') : 'week')
        }, []) */ //new URLSearchParams(typeSelect.current && typeSelect.current.value,periodSelect.current && periodSelect.current.value))}>
  useEffect(() => {
    if (typeSelect.current && periodSelect.current) {
      typeSelect.current.value = String(
        searchParams.get("type") ? searchParams.get("type") : "movie"
      );
      periodSelect.current.value = String(
        searchParams.get("period") ? searchParams.get("period") : "week"
      );
    }
  }, []);
  return (
    <div className="trending-search">
      <select
        name=""
        id="trending-type"
        ref={typeSelect}
        /*                 onChange={() => {
                                let param = String(typeSelect.current && typeSelect.current.value);
                                setSearchParams({ type: param })
                            }} */
      >
        <option value="movie">movie</option>
        <option value="all">all</option>
        <option value="tv">tv</option>
        <option value="person">person</option>
      </select>
      <select
        name=""
        id="trending-period"
        ref={periodSelect}
        /*                 onChange={() => {
                                let param = String(periodSelect.current && periodSelect.current.value);
                                setSearchParams({ period: param })
                            }} */
      >
        <option value="day">day</option>
        <option value="week">week</option>
      </select>
      <button
        onClick={() =>
          navigate(
            `${homePage}/trending?type=${
              typeSelect.current && typeSelect.current.value
            }&period=${periodSelect.current && periodSelect.current.value}`
          )
        }>
        trending
      </button>
    </div>
  );
};
const SmallTMDBObjectInfo = ({
  posterPath,
  originalTitle,
  genre_ids,
  tmdbRating,
  releaseDate,
  movieId,
  width = 170,
  height = 466,
}: {
  posterPath: string;
  originalTitle: string;
  genre_ids: number[];
  tmdbRating: number;
  releaseDate: Date;
  movieId: number;
  width?: number;
  height?: number;
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
      <a href={`${homePage}/movie/${movieId}`}>
        <img
          className="poster"
          src={`https://www.themoviedb.org/t/p/w300_and_h450_bestv2${posterPath}`}
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
          {optimizedGenres(genre_ids)}
          {/* {genres.getByIds(genre_ids).map((genre, i) => <div className='genre' key={i}>{genre}</div>)} */}
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
const SearchByTitle = () => {
  let searchInput = useRef<HTMLInputElement>(null);
  let navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const goSearching: MouseEventHandler<HTMLButtonElement> = () => {
    if (searchInput.current !== null) {
      if (searchInput.current.value === "") navigate(`${homePage}`);
      else {
        navigate(`${homePage}/search/?search=${searchInput.current.value}`);
      }
    }
  };
  useEffect(() => {
    if (searchParams.get("search"))
      if (
        searchInput.current !== null &&
        searchInput.current.value !== String(searchParams.get("search"))
      )
        searchInput.current.value = String(searchParams.get("search"));
  }, [searchParams]);
  return (
    <div className="search-by-name-container">
      <label htmlFor="search-by-name" className="label">
        Keyword to search in titles:
      </label>
      <input
        type="text"
        id="search-by-name"
        ref={searchInput}
        className="input"></input>
      <button className="button" onClick={goSearching}>
        Search!
      </button>
    </div>
  );
};
const SearchResults = () => {
  let { page } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();
  let [searchResults, setSearchResults]: [SearchResults | undefined, any] =
    useState();
  //let { movies } = response
  //params.page
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
              posterPath={movie.poster_path || "no poster path"}
              originalTitle={movie.original_title || movie.original_name}
              key={movie.id}
              genre_ids={movie.genres.map(({ id }) => id)}
              tmdbRating={movie.vote_average}
              releaseDate={new Date(movie.release_date || movie.first_air_date)}
              movieId={movie.id}
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
const AsideFavourites = () => {
  return <button>Show favourites</button>;
};
const FavouriteIcon = ({ id }: { id: number }) => {
  let [isFavourite, setIsFavourite] = useState(localFavourites.check(id));
  const toggleFavourite = () => {
    if (isFavourite) localFavourites.remove(id);
    else localFavourites.add(id);
    setIsFavourite(!isFavourite);
  };
  const SVGFavouriteIcom = () => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11 3.25H8.86465L7.86465 9.25H3.75V20.75H20.25V9.25H14.25V6.5C14.25 4.70507 12.7949 3.25 11 3.25ZM9.25 19.25H18.75V10.75H12.75V6.5C12.75 5.5335 11.9665 4.75 11 4.75H10.1353L9.25 10.0621V19.25ZM7.75 19.25V10.75H5.25V19.25H7.75Z"
        />
      </svg>
    );
  };
  /*     useEffect(() => {
            console.log('!!!!!!!!!!');
            console.log('FavouriteIcon useeffect is working!!!');
            console.log('!!!!!!!!!!');
            if (localFavourites.check(id))
                setIsFavourite(true)
        }, [isFavourite]) */
  return (
    <a
      onClick={toggleFavourite}
      className={`favourite-icon ${
        isFavourite ? "favourite" : "non-favourite"
      }`}>
      <SVGFavouriteIcom />
    </a>
  );
};
const NotInUseIMDBPlugin = ({
  title,
  imdbId,
}: {
  title: string;
  imdbId: string;
}) => {
  /////IMDB rating plugin
  //let imdbContainer = useRef<HTMLDivElement>(null)
  //let imdbRating = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    //console.log("IMDBPlugin useeffect is working!!!!!");
    let script = document.createElement("script");
    script.src =
      "https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/js/rating.js";
    script.async = true;
    script.id = "imdb-script";
    //imdbRating.current?.appendChild(script)
    if (!document.querySelector("#imdb-script")) {
      //console.log("IMDBPlugin adding script");
      document.body.appendChild(script);
    }
    return () => {
      if (document.querySelector("#imdb-script"))
        document.body.removeChild(script);
      if (document.querySelector("[id^=imdb-jsonp]") !== null) {
        document.body.removeChild(document.querySelector("[id^=imdb-jsonp]")!);
      }
    };
  }, []);
  return (
    <Fragment>
      {/* <div ref={imdbContainer} className='imdb-rating-conteiner'> */}
      <span
        /* ref={imdbRating}*/ className="imdbRatingPlugin"
        data-user="ur53822607"
        data-title={`tt${imdbId}`}
        data-style="p1">
        {/* {(console.log("rendering!!!!!!!!!!!!!!!!"), "")} */}
        <a href={`https://www.imdb.com/title/tt${imdbId}/?ref_=plg_rt_1`}>
          <img
            src="https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/images/imdb_46x22.png"
            alt={` ${title} on IMDb`}
          />
        </a>
      </span>
      {/* </div> */}
    </Fragment>
  );
  /////IMDB rating plugin
};
const SingleMoviePage = (movieDetails: MovieInfo) => {
  console.dir(movieDetails);
  let [recommendedMovies, setRecommendedMovies]: [MovieInfo[], any] = useState(
    []
  );
  let [similarMovies, setSimilarMovies]: [MovieInfo[], any] = useState([]);
  let [loading, setLoading]: [boolean, any] = useState(true);
  useLayoutEffect(() => {
    Promise.all([
      getRecommended(movieDetails.id, 1),
      getSimilar(movieDetails.id, 1),
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
  )
  else return (
    <div className="single-movie-page">
      <div className="short-info-container">
        <img
          className="poster"
          src={`https://www.themoviedb.org/t/p/w300_and_h450_bestv2${movieDetails.poster_path}`}
          alt={movieDetails.original_title || "poster"}
          srcSet={`https://www.themoviedb.org/t/p/w300_and_h450_bestv2${movieDetails.poster_path} 1x, https://www.themoviedb.org/t/p/w600_and_h900_bestv2${movieDetails.poster_path} 2x`}
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
          <FavouriteIcon id={movieDetails.id} />
        </div>
      </div>
      <div className="movie-description">
        <p className="overview">{movieDetails.overview}</p>
        {/* <p className='imdb-rating'>IMDB rating:</p> */}
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
const MoviePageById = () => {
  const id = String(useParams().id);
  const [movieDetails, setMovieDetails]: [MovieInfo | undefined, any] =
    useState();

  useEffect(() => {
    getMovieDetailsByTmdbId(id).then((movieData) => {
      //console.log('movieData', movieData)
      if (movieData.length === 0) setMovieDetails(undefined);
      else {
        Promise.all([getDirectors(id), getIMDBRating(movieData.imdb_id)]).then(
          ([directors, imdb_rating]) => {
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
          }
        );
      }
    });
  }, []);
  /*   getMovieDetailsByTmdbId(id).then((fetchedMovieDetails) => {
    setMovieDetails(fetchedMovieDetails);
  }); */
  //return <SingleMoviePageMemo {...movieDetails} />;
  if (movieDetails) return <SingleMoviePage {...movieDetails} />;
  else return <></>;
};

const SmallestTMDBObjectInfo = ({ movieInfo }: { movieInfo: MovieInfo }) => {
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

function App() {
  return (
    <Fragment>
      <header className="header">
        <img
          className="header-img"
          src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg"
          alt="TMBD title"></img>
      </header>
      <aside className="aside">
        <LoginLogout />
        <FindByIMDBId />
        <FilterTrending />
        <SearchByTitle />
        <AsideFavourites />
      </aside>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer"></footer>
    </Fragment>
  );
}
/* console.log('!!!!!!!!!!');
getRecommended("385687", 1).then((data) => console.dir(data.results.map((movie:MovieInfo)=>movie.title+'__'+movie.original_title)));
console.log('!!!!!!!!!!'); */
//385687
export { MoviePageById, SearchResults, Trending, SearchIMDBResult };
export default App;
