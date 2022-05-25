import React from "react"
import { tokenv4, tokenv3 } from "../constants";
//const local = window.localStorage;
const fetchData = async ({ url, headers, method = "GET", body }: { url: string, headers: (HeadersInit | undefined), method: (string | undefined), body: (Object | undefined) }) => {
    let fetchParams: (RequestInit | undefined) = {};
    if (!headers && !method)
        fetchParams = undefined;
    else {
        if (method)
            Object.assign(fetchParams, { method })
        if (headers)
            Object.assign(fetchParams, { headers })
    }
    const clearData = await fetch(url, fetchParams).then(response => {
        console.log('fetchData', 'fetchParams', fetchParams, 'url', url, 'headers', headers, 'method', method, 'body', body, 'response', response)
        if (method === "POST")
            console.log('POST!!!!!',);
        if (response.ok)
            return response.json()
        else
            return undefined
    }).catch(err => err)
    console.log('clearData', clearData)
    return clearData
};
const createRequestToken = () => {
    //const headers:HeadersInit = new Headers()
    return fetchData({ url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${tokenv3}`, headers: undefined, method: "GET", body: undefined })
        .then((response) => response.request_token)
}
const example = () => {
    return fetchData({
        url: 'https://api.themoviedb.org/3/movie/76341',
        method: "GET",
        headers: {
            'Authorization': "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZTEyMmJiYTI4YmIwMGZiMjZiYThkZDM2MWMyMDBmYiIsInN1YiI6IjYyNTE0OWE2NjdlMGY3MDA1MjQ3NjVlZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ngZMShvl6u9OnmIGBb5VsbBvUpswL1kDAfcvEWy8y5s",
            'Content-Type': "application/json;charset=utf-8"
        },
        body: undefined
    })
}
const requestLogin = (request_token: string) => {
    console.log('requestLogin', requestLogin);
    window.location.replace(`https://www.themoviedb.org/authenticate/${request_token}?redirect_to=http://localhost:3000/`)
}
const createSession = (request_token: string) => {
    return fetchData({
        url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${tokenv3}&request_token=${request_token}`, headers: undefined, method: 'POST', body: undefined
    }).then((response) => response.session_id)
}
const getAccountDetails = (sessionId: string) => {
    return fetchData({
        url: `https://api.themoviedb.org/3/account?api_key=${tokenv3}&session_id=${sessionId}`, headers: undefined, method: 'GET', body: undefined
    })
    //https://api.themoviedb.org/3/account?api_key=<<api_key>>
}
const getMovieDetails = (movieId: string) => {
    return fetchData({
        url: `https://api.themoviedb.org/3/find/tt${movieId}?api_key=${tokenv3}&language=en-US&external_source=imdb_id`,
        headers: undefined, method: "GET", body: undefined
    })
}
const getGenres = () => {
    return fetchData({
        url: `https://api.themoviedb.org/3/genre/movie/list?api_key=${tokenv3}&language=en-US`,
        headers: undefined, method: "GET", body: undefined
    })
}
const getTrending = (type: string | null = 'movie', period: string | null = 'week',page:string) => {
    let correctType = new Set(['all', 'tv', 'person', 'movie']).has(String(type)) ? String(type) : 'movie'
    let correctPeriod = new Set(['day', 'week']).has(String(period)) ? String(period) : 'week'
    return fetchData({
        url: `https://api.themoviedb.org/3/trending/${correctType}/${correctPeriod}?api_key=${tokenv3}&page=${page}`,
        headers: undefined, method: "GET", body: undefined
    })
}
export { getTrending, getMovieDetails, fetchData, createRequestToken, example, requestLogin, createSession, getAccountDetails, getGenres };