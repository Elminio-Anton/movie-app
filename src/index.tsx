import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App,{SearchIMDBResult,Trending,SearchResults,MoviePageById} from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {homePage} from './constants'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path={`${homePage}`} element={<App />}>
                    <Route index element = {<Trending/>}></Route>
                    <Route path={`${homePage}/search_by_imdb_id`} element={<SearchIMDBResult/>}>
                        {/* <Route index element={<Search/>}/> indicator*/}
                        <Route path=':imdbId' element={<SearchIMDBResult/>}/>
                    </Route>
                    <Route path={`${homePage}trending`} element = {<Trending/>}>
                        <Route path=":page" element={<Trending/>}></Route>
                    </Route>
                    <Route path={`${homePage}search`} element = {<SearchResults/>}>
                        <Route path=":page" element={<SearchResults/>}></Route>
                    </Route>
                    <Route path={`${homePage}movie`} element = {<MoviePageById/>}>
                        <Route path=":id" element={<MoviePageById/>}></Route>
                    </Route>
                    <Route path={`${homePage}tv`} element = {<MoviePageById/>}>
                        <Route path=":id" element={<MoviePageById/>}></Route>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

//document.getElementById('root')
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
