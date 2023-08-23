import {
  ChangeEventHandler,
  Fragment,
  useEffect,
  useState,
  useRef,
  MouseEventHandler,
  useLayoutEffect,
} from "react";
import "./app.css";
import "./fonts.css";
import "./layout.css";
import {
  createRequestToken,
  requestLogin,
  createSession,
  getAccountDetails,
} from "../src/requests/common";
import {
  Outlet,
  useNavigate,
  useLocation,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { homePage } from "./constants";

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

function LoginLogout() {
  let navigate = useNavigate();
  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  const [accountName, setAccountName] = useState("noname");

  const initToken = (updateSession: Function, updateName: Function) => {
    if (searchParams.get("approved") === "true") {
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
      });
    };
    
  const redirectToLogin = () => {
    requestLogin(request_token.get());
  };

  const logOut = () => {
    localStorage.clear();
    navigate(`${homePage}`, { replace: true });
    initToken(()=>{}, setAccountName);
  };

  useEffect(() => {
    initToken(()=>{}, setAccountName);
  }, []);

  return sessionId.get() !== "null" ? (
    <div className="login-container">
      <span className="login-text">You are logged in as {accountName}</span>
      <button onClick={logOut} className="logout-button button">
        Log out
      </button>
    </div>
  ) : (
    <div className="login-container">
      <button onClick={redirectToLogin} className="login-button button">
        Log in
      </button>
    </div>
  );
}

function FindByIMDBId() {
  let inputId = useRef<HTMLInputElement>(null);
  let navigate = useNavigate();
  let params = useParams();

  const beginSearch: ChangeEventHandler<HTMLInputElement> = () => {
    if (inputId.current !== null) {
      inputId.current.value =
        inputId.current.value
          .split("")
          .filter((number) => !Number.isNaN(number))
          .join("");
      if (inputId.current.value === "") navigate(`${homePage}`);
      else navigate(`${homePage}/search_by_imdb_id/${inputId.current.value}`);
    }
  };

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

const FilterTrending = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeSelect = useRef<HTMLSelectElement>(null);
  const periodSelect = useRef<HTMLSelectElement>(null);

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
        className="select-type"
        name=""
        id="trending-type"
        ref={typeSelect}
      >
        <option value="movie">movie</option>
        <option value="all">all</option>
        <option value="tv">tv</option>
      </select>
      <select
        className="select-period"
        name=""
        id="trending-period"
        ref={periodSelect}
      >
        <option value="day">day</option>
        <option value="week">week</option>
      </select>
      <button
        className="button"
        onClick={() =>
          navigate(
            `${homePage}/trending?type=${
              typeSelect.current && typeSelect.current.value
            }&period=${periodSelect.current && periodSelect.current.value}`
          )
        }>
        Trending
      </button>
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
        className="input-name"></input>
      <button className="button" onClick={goSearching}>
        Search!
      </button>
    </div>
  );
};

const NotInUseIMDBPlugin = ({
  title,
  imdbId,
}: {
  title: string;
  imdbId: string;
}) => {
  useLayoutEffect(() => {
    let script = document.createElement("script");
    script.src =
      "https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/js/rating.js";
    script.async = true;
    script.id = "imdb-script";
    if (!document.querySelector("#imdb-script")) {
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
      <span
        className="imdbRatingPlugin"
        data-user="ur53822607"
        data-title={`tt${imdbId}`}
        data-style="p1">
        <a href={`https://www.imdb.com/title/tt${imdbId}/?ref_=plg_rt_1`}>
          <img
            src="https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/images/imdb_46x22.png"
            alt={` ${title} on IMDb`}
          />
        </a>
      </span>
    </Fragment>
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
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </Fragment>
  );
}

export default App;
