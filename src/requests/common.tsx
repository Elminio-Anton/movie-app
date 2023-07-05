import React from "react";
import { tokenv4, tokenv3 } from "../constants";
//const local = window.localStorage;
const fetchData = async ({
  url,
  headers,
  method = "GET",
  body,
}: {
  url: string;
  headers: HeadersInit | undefined;
  method: string | undefined;
  body: Object | undefined;
}) => {
  let fetchParams: RequestInit | undefined = {};
  if (!headers && !method) fetchParams = undefined;
  else {
    if (method) Object.assign(fetchParams, { method });
    if (headers) Object.assign(fetchParams, { headers });
  }
  const clearData = await fetch(url, fetchParams)
    .then((response) => {
  /*     console.log(
        "fetchData",
        "fetchParams",
        fetchParams,
        "url",
        url,
        "headers",
        headers,
        "method",
        method,
        "body",
        body,
        "response",
        response
      ); */
      if (method === "POST") console.log("POST!!!!!");
      if (response.ok) return response.json();
      else return undefined;
    })
    .catch((err) => err);
  //console.log("clearData", clearData);
  return clearData;
};
const createRequestToken = () => {
  //const headers:HeadersInit = new Headers()
  return fetchData({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${tokenv3}`,
    headers: undefined,
    method: "GET",
    body: undefined,
  }).then((response) => response.request_token);
};
const example = () => {
  return fetchData({
    url: "https://api.themoviedb.org/3/movie/76341",
    method: "GET",
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZTEyMmJiYTI4YmIwMGZiMjZiYThkZDM2MWMyMDBmYiIsInN1YiI6IjYyNTE0OWE2NjdlMGY3MDA1MjQ3NjVlZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ngZMShvl6u9OnmIGBb5VsbBvUpswL1kDAfcvEWy8y5s",
      "Content-Type": "application/json;charset=utf-8",
    },
    body: undefined,
  });
};
const requestLogin = (request_token: string) => {
  //console.log("requestLogin", requestLogin);
  window.location.replace(
    `https://www.themoviedb.org/authenticate/${request_token}?redirect_to=http://localhost:3000/`
  );
};
const createSession = (request_token: string) => {
  return fetchData({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${tokenv3}&request_token=${request_token}`,
    headers: undefined,
    method: "POST",
    body: undefined,
  }).then((response) => response.session_id);
};
const getAccountDetails = (sessionId: string) => {
  return fetchData({
    url: `https://api.themoviedb.org/3/account?api_key=${tokenv3}&session_id=${sessionId}`,
    headers: undefined,
    method: "GET",
    body: undefined,
  });
  //https://api.themoviedb.org/3/account?api_key=<<api_key>>
};
const getMovieDetailsByImdbId = (movieId: string) => {
  return fetchData({
    url: `https://api.themoviedb.org/3/find/tt${movieId}?api_key=${tokenv3}&language=en-US&external_source=imdb_id`,
    headers: undefined,
    method: "GET",
    body: undefined,
  });
};
const getGenres = () => {
  return fetchData({
    url: `https://api.themoviedb.org/3/genre/movie/list?api_key=${tokenv3}&language=en-US`,
    headers: undefined,
    method: "GET",
    body: undefined,
  });
};
const getTrending = (
  type: string | null = "movie",
  period: string | null = "week",
  page: string
) => {
  let correctType = new Set(["all", "tv", "person", "movie"]).has(String(type))
    ? String(type)
    : "movie";
  let correctPeriod = new Set(["day", "week"]).has(String(period))
    ? String(period)
    : "week";
  return fetchData({
    url: `https://api.themoviedb.org/3/trending/${correctType}/${correctPeriod}?api_key=${tokenv3}&page=${page}`,
    headers: undefined,
    method: "GET",
    body: undefined,
  });
};
const getSearchResults = (searchString: string, page: number | null = 1) => {
  return fetchData({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${tokenv3}&query=${searchString}&page=${page}`,
    headers: undefined,
    method: "GET",
    body: undefined,
  }).then((response) =>
    Promise.all(
      response.results
        .map(({ id }: { id: number }) => id)
        .map((id: number) =>
          fetchData({
            url: `https://api.themoviedb.org/3/movie/${id}?api_key=4e122bba28bb00fb26ba8dd361c200fb&language=en-US`,
            headers: undefined,
            method: "GET",
            body: undefined,
          })
        )
    ).then((movies) => {
      return { results: movies, total_pages: response.total_pages };
    })
  );
};
const getDirectors = (id: string) => {
  return fetch(
    `https://api.themoviedb.org/3/movie/${id}/credits?api_key=4e122bba28bb00fb26ba8dd361c200fb`
  )
    .then((response) => response.json())
    .then(
      (jsonData) =>
        jsonData.crew &&
        jsonData.crew.filter(({ job }: { job: string }) => job === "Director")
    );
};
/*         .then((data) => {
            console.log('data', data);
            return document.querySelector('.container').innerHTML += data
        }) */
const getIMDBRating = (id: string) =>
  fetch(`https://imdb-api.com/en/API/UserRatings/k_v4mu0b39/tt${id}`)
    .then((response) => response.json())
    .then((jsonData) => {
/*       console.log("!!!!!!!!!!");
      console.log(jsonData, id);
      console.log("!!!!!!!!!!"); */
      return jsonData.totalRating;
    });

const getMovieDetailsByTmdbId = (movie_id: string) => {
  return fetchData({
    url: `https://api.themoviedb.org/3/movie/${movie_id}`,
    headers: {
      Authorization: `Bearer ${tokenv4}`,
      accept: `application/json`
    },
    method: "GET",
    body: undefined,
  });
};

const getRecommended = (movie_id: string | number,page:number=1) => {
  return fetchData({
    url: `https://api.themoviedb.org/3/movie/${movie_id}/recommendations?language=en-US&page=${page}`,
    headers: {
      Authorization: `Bearer ${tokenv4}`,
      accept: `application/json`
    },
    method: "GET",
    body: undefined,
  });
};
const getSimilar = (movie_id: string | number,page:number=1) => {
  return fetchData({
    url: `https://api.themoviedb.org/3/movie/${movie_id}/similar?language=en-US&page=${page}`,
    headers: {
      Authorization: `Bearer ${tokenv4}`,
      accept: `application/json`
    },
    method: "GET",
    body: undefined,
  });
};

export {
  getIMDBRating,
  getDirectors,
  getSearchResults,
  getTrending,
  getMovieDetailsByImdbId,
  fetchData,
  createRequestToken,
  example,
  requestLogin,
  createSession,
  getAccountDetails,
  getGenres,
  getMovieDetailsByTmdbId,
  getRecommended,
  getSimilar,
};

/* console.log('!!!!!!!!!!');
getMovieDetailsByTmdbId('281234321').then(resp=>console.log(resp))
console.log('!!!!!!!!!!'); */