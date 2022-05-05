import React, { Fragment, useEffect, useState } from 'react';
import './app.css';
import './fonts.css';
import './layout.css';
import { createRequestToken, requestLogin, createSession, getAccountDetails } from '../src/requests/common';

const HOME: (string | URL) = new URL('http://localhost:3000/')

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
const initToken = (updateState: Function, updateSession: Function, updateName: Function) => {

    if (window.location.href.match(/approved=true$/)) {
        let request_tokenFromUrl = window.location.href.match(/(?<=request_token=).*(?=&)/)
        request_token.set(request_tokenFromUrl ? request_tokenFromUrl[0] : '')
        updateState(request_token.get())
        if (sessionId.check() === false)
            createSession(request_token.get()).then(
                session_id => {
                    sessionId.set(session_id)
                    updateSession(sessionId.get())
                    window.location.replace(HOME)
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
                updateState(request_token.get())
            })
}
function LoginLogout() {
    const [token, setToken] = useState(request_token.get())
    const [sessionOn, setSession] = useState(false)
    const [accountName, setAccountName] = useState('noname')
    console.log('token=', token)
    const redirectToLogin = () => {
        requestLogin(request_token.get());
    }
    const logOut = () => {
        localStorage.clear()
        setSession(false)
        window.location.replace(HOME)
        initToken(setToken, setSession, setAccountName)
    }
    useEffect(() => { initToken(setToken, setSession, setAccountName) }, [])
    if (sessionOn)
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
        )
}
/* function FindByIMDBId() {
    return (
        <form className='search-form'>
            <input type='text' name='movie-id' ></input>
            <button className='button-search-by-id' id='search-by-id'>Search</button>
        </form>
    )
} */
function App() {

    return (
        <Fragment>
            <header>
                <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg" alt='TMBD title'></img>
            </header>
            <main>
                <LoginLogout />

            </main>
        </Fragment>
    );
}

export default App;
