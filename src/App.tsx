import React, { ChangeEventHandler, Fragment, useEffect, useState, useRef, LegacyRef } from 'react';
import './app.css';
import './fonts.css';
import './layout.css';
import ReactLoading from 'react-loading'
import { getMovieDetails, createRequestToken, requestLogin, createSession, getAccountDetails } from '../src/requests/common';
import { Link, Outlet, useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
//const HOME: (string | URL) = new URL('http://localhost:3000/')

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

function LoginLogout() {
    let navigate = useNavigate()
    let location = useLocation()
    let searchParams = new URLSearchParams(location.search)
    console.log('searchParams', searchParams, typeof searchParams);
    console.log('location', location.pathname, location.search);
    //debugger
    const initToken = (updateSession: Function, updateName: Function) => {
        if (searchParams.get("approved") === "true") {
            console.log('params', searchParams)
            request_token.set(String(searchParams.get("request_token")))
            if (sessionId.check() === false)
                createSession(request_token.get())
                    .then(
                        session_id => {
                            sessionId.set(session_id)
                            updateSession(sessionId.get())
                            navigate("/", { replace: true })
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
        navigate("/", { replace: true })
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
            navigate(`/search_by_imdb_id/${inputId.current.value}`)
            console.log(typeof inputId.current.value);
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
/* function Loading(){
    return(

    )
} */
export function SearchResult() {
    /*     let params = useParams()
        //let [loading, setLoading] = useState(true);
        let [ready, setReady] = useState(false)
        if (params.imdbId && params.imdbId.length === 7)
            showMovie()
        else if (ready) {
            return (
                <Fragment>
                    <div>{String(movieDetails)}</div>
                    <Outlet />
                </Fragment>
            )
        } else {
            //if (ready) setReady(false)
            return (
                <div className='loader-container'>
                    <ReactLoading type='spinningBubbles' color='#01b4e4' className="loader" height={200} width={200} />
                </div>
            )
        } */
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
                console.log('movieData', movieData)
                setMovieDetails(movieData.movie_results[0])
                setReady(true)
                //setLoading(false)
            })
    }, [fullId])
    useEffect(() => {
        if (params.imdbId && params.imdbId.length === 7)
            if (fullId === params.imdbId)
                setReady(true)
            else
                setFullId(params.imdbId)
        else if (ready && params.imdbId && params.imdbId.length !== 7)
            setReady(false)
    }, [params.imdbId])
    /*     if (params.imdbId && params.imdbId.length === 7)
            setFullId(params.imdbId)
        else if (ready && params.imdbId && params.imdbId.length !== 7) {
            setReady(false)
        }
        else */
    if (ready && params.imdbId && params.imdbId.length === 7)
        return (
            <Fragment>
                <img className='poster' src={`https://www.themoviedb.org/t/p/w300_and_h450_bestv2${movieDetails.poster_path}`}
                //data-src={`/t/p/w300_and_h450_bestv2${movieDetails.poster_path}`}
                //data-srcset={`/t/p/w300_and_h450_bestv2${movieDetails.poster_path} 1x, /t/p/w600_and_h900_bestv2${movieDetails.poster_path} 2x`}
                alt="Пила 3" 
                srcSet={`https://www.themoviedb.org/t/p/w300_and_h450_bestv2${movieDetails.poster_path} 1x, https://www.themoviedb.org/t/p/w600_and_h900_bestv2${movieDetails.poster_path} 2x`}/>


                <div>Title: {movieDetails.original_title}</div>
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
function App() {

    return (
        <Fragment>
            <header className='header'>
                <img className='header-img' src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg" alt='TMBD title'></img>
            </header>
            <aside className="aside">
                <LoginLogout />
                <FindByIMDBId />
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