import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import styles from './Main.module.scss';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

// components
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Banner from './components/Banner';
import Error from './components/Error';

// pages
import Recent from './pages/Recent';
import Watch from './pages/Watch';
import Genre from './pages/Genre';
import Genres from './pages/Genres';
import Search from './pages/Search';

ReactDOM.render(
  <React.StrictMode>
    <Navigation />

    <div className={styles.content}>
      {/* banner */}
      {/* <Banner type={'info'} position={'top'}>
        <div>
          <BrowserRouter>
            <span>
              Join our&nbsp;
              <Link
                to={{ pathname: '//discord.gg/NgBG7sh42w' }}
                title={'Discord server'}
              >
                <u>Discord server</u>
              </Link>
              &nbsp;for FAQs, giveaways, and more
            </span>
          </BrowserRouter>
        </div>
      </Banner> */}

      <BrowserRouter>
        <Routes>
          <Route path={'/'} element={<Recent />} />
          <Route path={'/watch/:slug/:episode'} element={<Watch />} />
          <Route path={'/genre/:genre'} element={<Genre />} />
          <Route path={'/genres'} element={<Genres />} />
          <Route path={'/search'} element={<Search />} />

          {/* 404 */}
          <Route
            path={'*'}
            element={<Error status={404} message={'Page not found'} />}
          />
        </Routes>
      </BrowserRouter>

      <Footer />
    </div>
  </React.StrictMode>,
  document.querySelector('main')
);
