import React, { Fragment, useEffect, useState } from 'react';
import './app.css';
import './fonts.css';
import './layout.css';
import { createRequestToken, requestLogin, createSession, getAccountDetails } from '../src/requests/common';
import { Link, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
    return sessionOn ?
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
    const searchById = () => {

    }
    return (
        <form className='search-form'>
            <input type='number' name='movie-id' className='id-input'></input>
            <button className='button-search-by-id' id='search-by-id' onClick={searchById}>Search</button>
        </form>
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
