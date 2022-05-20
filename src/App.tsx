import React, { ChangeEventHandler, Fragment, useEffect, useState, useRef, LegacyRef } from 'react';
import './app.css';
import './fonts.css';
import './layout.css';
import ReactLoading from 'react-loading'
import { getTrending, getMovieDetails, createRequestToken, requestLogin, createSession, getAccountDetails, getGenres } from '../src/requests/common';
import { Link, Outlet, useNavigate, useLocation, useSearchParams, useParams, Navigate } from 'react-router-dom';
import { type } from '@testing-library/user-event/dist/type';
import {homePage} from './constants'
//const HOME: (string | URL) = new URL('http://localhost:3000/')
type Trending = {
    page: number,
    results: [MovieInfo],
    total_pages: number,
    total_results: number,
}
type MovieInfo = {
    poster_path: (string | null),
    release_date: string,
    genre_ids: [number],
    original_title: string,
    vote_average: number,
    id: number,
}

const request_token = (() => {
    const local = window.localStorage;
    return {
        get: () => {
            return String(local.getItem('request_token'))
        },
        set: (token: string) => {
            local.setItem('request_token', token)
        },
        check: () => {
            return local.getItem('request_token') || false
        }
    }
})()
const sessionId = (() => {
    const local = window.localStorage;
    return {
        get: () => {
            return String(local.getItem('session_id'))
        },
        set: (sessionId: string) => {
            return local.setItem('session_id', sessionId)
        },
        check: () => {
            return local.getItem('session_id') || false
        }
    }
})()
let genres = (() => {
    let innerGenres: { id: number, name: string };
    function isGenreKey<T>(
        genres: T,
        id: number,
    ): id is keyof Omit<T, string | symbol> {
        return id in innerGenres;
    }
    return {
        set: (genres: { id: number, name: string }) => {
            innerGenres = genres
        },
        getByIds: (genre_ids: [number]) => {
            return genre_ids.map(id => isGenreKey(innerGenres, id) ? genres[id] : '')
        },
        get: () => {
            return innerGenres;
        }
    }
})()
getGenres().then((genresArr) => {
    //console.log('GENRES!!!!!', genres);
    genres.set(genresArr.genres.reduce((newGenresObject: Object, genre: { id: number, name: string }) =>
        Object.assign(newGenresObject, { [genre.id]: genre.name }), {}
    ))
    //console.log('GENRES!!!!!', genres);
})
function LoginLogout() {
    let navigate = useNavigate()
    let location = useLocation()
    let searchParams = new URLSearchParams(location.search)
    //console.log('searchParams', searchParams, typeof searchParams);
    //console.log('location', location.pathname, location.search);
    //debugger
    const initToken = (updateSession: Function, updateName: Function) => {
        if (searchParams.get("approved") === "true") {
            //console.log('params', searchParams)
            request_token.set(String(searchParams.get("request_token")))
            if (sessionId.check() === false)
                createSession(request_token.get())
                    .then(
                        session_id => {
                            sessionId.set(session_id)
                            updateSession(sessionId.get())
                            navigate(`${homePage}`, { replace: true })
                            getAccountDetails(sessionId.get()).then(
                                (account) => {
                                    if (account) {
                                        updateName(account.username)
                                        updateSession(true)
                                    }
                                    else {
                                        localStorage.clear()
                                        updateSession(false)
                                    }
                                }
                            )
                        }
                    )
        }
        else if (sessionId.check()) {
            getAccountDetails(sessionId.get()).then(
                (account) => {
                    if (account) {
                        updateName(account.username)
                        updateSession(true)
                    }
                    else {
                        localStorage.clear()
                        updateSession(false)
                    }
                }
            )
        }
        else
            createRequestToken()
                .then(token => {
                    request_token.set(token)
                    //updateState(request_token.get())
                })
    }
    //const [token, setToken] = useState(request_token.get())
    const [sessionOn, setSession] = useState(false)
    const [accountName, setAccountName] = useState('noname')
    //console.log('token=', token)
    const redirectToLogin = () => {
        requestLogin(request_token.get());
    }
    const logOut = () => {
        localStorage.clear()
        setSession(false)
        navigate(`${homePage}`, { replace: true })
        //window.location.replace(HOME)
        initToken(setSession, setAccountName)
    }
    useEffect(() => { initToken(setSession, setAccountName) }, [])
    return sessionId.get() !== 'null' ?
        (
            <div className='login-container'>
                <span className='login-text'>You are logged in as {accountName}</span>
                <button onClick={logOut} className='logout-button'>Log out</button>
            </div>
        ) :
        (
            <div className='login-container'>
                <button onClick={redirectToLogin} className='login-button'>Log in</button>
            </div>
        )
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
    let inputId = useRef<HTMLInputElement>(null)
    let navigate = useNavigate()
    let params = useParams()
    const beginSearch: ChangeEventHandler<HTMLInputElement> = () => {
        if (inputId.current !== null) {
            inputId.current.value = //String(parseInt(event.currentTarget.value) || '')
                inputId.current.value.split('').filter(number => +number === +number).join('')
            if (inputId.current.value === '')
                navigate(`${homePage}`)
            else
                navigate(`${homePage}/search_by_imdb_id/${inputId.current.value}`)
            //console.log('inputId.current.value', typeof inputId.current.value);
        }
        //params = target.value
    }
    //<button className='button-search-by-id' id='search-by-id' onClick={searchById}>Search</button>
    return (
        <Fragment>
            <label htmlFor="searchImdb" title='Should be 7 numbers long. You can find it in URL, for example: 0489270 in https://www.imdb.com/title/tt0489270/' className='imdb-search-label'>Enter IMDB ID for movie:</label>
            <input id='searchImdb' ref={inputId} value={params.imdbId} maxLength={7} inputMode='numeric' type='text' name='movie-id' className='id-input' onChange={beginSearch}></input>
        </Fragment>

    )
}

export function SearchResult() {
    let params = useParams()
    let [ready, setReady] = useState(false)
    let [movieDetails, setMovieDetails] = useState({
        "genre_ids": [],
        "original_language": "unknown",
        "original_title": "unknown",
        "poster_path": "unknown",
        "video": false,
        "vote_average": 0.001,
        "overview": "unknown",
        "release_date": "unknown",
        "vote_count": 0,
        "title": "unknown",
        "adult": false,
        "popularity": 0.001
    })
    let [fullId, setFullId] = useState('')
    useEffect(() => {
        getMovieDetails(String(params.imdbId))
            .then((movieData) => {
                //console.log('movieData', movieData)
                if (movieData.movie_results.length === 0)
                    setMovieDetails({
                        "genre_ids": [],
                        "original_language": "unknown",
                        "original_title": "unknown",
                        "poster_path": "unknown",
                        "video": false,
                        "vote_average": 0.001,
                        "overview": "unknown",
                        "release_date": "unknown",
                        "vote_count": 0,
                        "title": "unknown",
                        "adult": false,
                        "popularity": 0.001
                    })
                else {
                    setMovieDetails(movieData.movie_results[0])
                    setReady(true)
                }
            })
    }, [fullId])
    useEffect(() => {
        if (params.imdbId && params.imdbId.length === 7)
            if (fullId === params.imdbId && movieDetails.original_title !== 'unknown')
                setReady(true)
            else
                setFullId(params.imdbId)
        else if (ready && params.imdbId && params.imdbId.length !== 7)
            setReady(false)
    }, [params.imdbId])

    if (ready && params.imdbId && params.imdbId.length === 7)
        return (
            <Fragment>
                <img className='poster' src={`https://www.themoviedb.org/t/p/w300_and_h450_bestv2${movieDetails.poster_path}`}
                    alt={movieDetails.original_title}
                    srcSet={`https://www.themoviedb.org/t/p/w300_and_h450_bestv2${movieDetails.poster_path} 1x, https://www.themoviedb.org/t/p/w600_and_h900_bestv2${movieDetails.poster_path} 2x`} />

                <div>Title: {movieDetails.original_title}</div>
                <div>Genres: {movieDetails.genre_ids.map(id => genres[id]).join(', ')}</div>
                <div>Average vote: {movieDetails.vote_average}</div>
                <div>Vote count: {movieDetails.vote_count}</div>
            </Fragment>
        )

    else return (
        <div className='loader-container'>
            <ReactLoading type='spinningBubbles' color='#01b4e4' className="loader" height={200} width={200} />
        </div>
    )
}
export function Trending() {
    /*const TrendingMovies = React.lazy(()=>import('./lazyComponents/trendingMovies.tsx'))
    <Suspense fallback={<div>Loading...</div>}>
        <TrendingMovies/>
    </Suspense>*/
    let [searchParams, setSearchParams] = useSearchParams()
    let [loading, setLoading] = useState(true)
    let [trendingMovies, setTrendingMovies]: [(Trending | undefined), any] = useState()
    useEffect(() => {
        getTrending(searchParams.get('type'), searchParams.get('period')).then(
            (response) => {
                console.log('getTrending!!!!!');
                if (response) {
                    setTrendingMovies(response)
                    setLoading(false)
                }
            }
        )
    }, [searchParams])
    const calcMoviesPerPage = () => {

    }
    const calcPagesAmount = () => {

    }
    return loading ?
        (
            <div className='loader-container'>
                <ReactLoading type='spinningBubbles' color='#01b4e4' className="loader" height={200} width={200} />
            </div>
        ) :
        (
            <Fragment>
                <div className='popular-movies-container'>
                    {trendingMovies && trendingMovies.results.map(
                        movie => <SmallTMDBObjectInfo
                            posterPath={movie.poster_path || 'no poster path'}
                            originTitle={movie.original_title}
                            key={movie.id}
                            genre_ids={movie.genre_ids}
                            tmdbRating={movie.vote_average}
                            releaseDate={new Date(movie.release_date)}
                        />
                    )
                    }
                </div>
                <div className='pagination-container'>pagination will be there</div>
            </Fragment>
        )
}
const FilterTrending = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const typeSelect = useRef<HTMLSelectElement>(null)
    const periodSelect = useRef<HTMLSelectElement>(null)
    /*     let defaultType = 'movie';
        let defaultPeriod = 'week';
        useEffect(() => {
            defaultType = String(searchParams.get('type') ? searchParams.get('type') : 'movie')
            defaultPeriod = String(searchParams.get('period') ? searchParams.get('period') : 'week')
        }, []) *///new URLSearchParams(typeSelect.current && typeSelect.current.value,periodSelect.current && periodSelect.current.value))}>
    useEffect(() => {
        if (typeSelect.current && periodSelect.current) {
            typeSelect.current.value = String(searchParams.get('type') ? searchParams.get('type') : 'movie')
            periodSelect.current.value = String(searchParams.get('period') ? searchParams.get('period') : 'week')
        }
    }, [])
    return (
        <div className='trending-search'>
            <select name="" id="trending-type" ref={typeSelect}
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
            <select name="" id="trending-period" ref={periodSelect}
            /*                 onChange={() => {
                                let param = String(periodSelect.current && periodSelect.current.value);
                                setSearchParams({ period: param })
                            }} */
            >
                <option value="day">day</option>
                <option value="week">week</option>
            </select>
            <button onClick={() => navigate(`${homePage}/trending?type=${typeSelect.current && typeSelect.current.value}&period=${periodSelect.current && periodSelect.current.value}`)}>
                trending
            </button>
        </div>
    )
}

const SmallTMDBObjectInfo = ({ posterPath, originTitle, genre_ids, tmdbRating, releaseDate }:
    { posterPath: string, originTitle: string, genre_ids: [number], tmdbRating: number, releaseDate: Date }) => {
    let ratingColor =
        tmdbRating === 0 ?
            'rgb(128,128,128)' :
            tmdbRating <= 4 ?
                'rgb(255,0,0)' :
                tmdbRating <= 5 ?
                    'rgb(255,165,0)' :
                    `rgb(0,${100 + Math.round((tmdbRating - 5) * 20)},0)`
    let ratingStyle = { 
        color: `#0d253f`,
        background: `radial-gradient(circle, #90cea1 0%, #90cea1 30%, ${ratingColor} 65%)`, 
    }
    return (
        <div className='small-info'>
            <img className='poster' src={`https://www.themoviedb.org/t/p/w300_and_h450_bestv2${posterPath}`}></img>
            <div className='genres'>Genres: {genres.getByIds(genre_ids)}</div>
            <div className='origin-title'>Title: {originTitle}</div>
            <div className='tmdb-rating'>TMDB rating:
                <div style={ratingStyle}
                    className='rating'>{tmdbRating}
                </div>
            </div>
            <div className='release-date'>
                <span>Release date:</span>
                <span>
                    {releaseDate.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>
        </div>
    )
}
function App() {
    return (
        <Fragment>
            <header className='header'>
                <img className='header-img' src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg" alt='TMBD title'></img>
            </header>
            <aside className="aside">
                <LoginLogout />
                <FindByIMDBId />
                <FilterTrending />
            </aside>
            <main className='main'>
                <Outlet />
            </main>
            <footer className='footer'>
            </footer>
        </Fragment>
    );
}

export default App;