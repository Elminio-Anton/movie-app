import React from "react"
import { tokenv4, tokenv3 } from "../constants";
//const local = window.localStorage;
const fetchData = async ({ url, headers = {}, method = "GET", body = {} }: { url: string, headers: HeadersInit, method: string, body: Object }) => {
    const clearData = await fetch(url, { method, headers }).then(response => {
        console.log('url', url, 'headers', headers, 'method', method, 'body', body, 'response', response)
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
    return fetchData({ url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${tokenv3}`, headers: {}, method: "GET", body: {} })
    .then((response)=>response.request_token)
}
const example = () => {
    return fetchData({
        url: 'https://api.themoviedb.org/3/movie/76341',
        method: "GET",
        headers: {
            'Authorization': "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZTEyMmJiYTI4YmIwMGZiMjZiYThkZDM2MWMyMDBmYiIsInN1YiI6IjYyNTE0OWE2NjdlMGY3MDA1MjQ3NjVlZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ngZMShvl6u9OnmIGBb5VsbBvUpswL1kDAfcvEWy8y5s",
            'Content-Type': "application/json;charset=utf-8"
        },
        body: {}
    })
}
const requestLogin = (request_token: string) => {
    window.location.replace(`https://www.themoviedb.org/authenticate/${request_token}?redirect_to=http://localhost:3000/`)
}
const createSession = (request_token: string) => {
    return fetchData({
        url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${tokenv3}&request_token=${request_token}`, headers: {}, method: 'POST', body: {}
    }).then((response)=>response.session_id)
}
const getAccountDetails = (sessionId: string) => {
    return fetchData({
        url: `https://api.themoviedb.org/3/account?api_key=${tokenv3}&session_id=${sessionId}`, headers: {}, method: 'GET', body: {}
    })
    //https://api.themoviedb.org/3/account?api_key=<<api_key>>
}
export { fetchData, createRequestToken, example, requestLogin, createSession, getAccountDetails };