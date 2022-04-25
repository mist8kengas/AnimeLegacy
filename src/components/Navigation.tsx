import styles from './Navigation.module.scss';

// fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAnglesLeft,
  faAnglesRight,
  faBars,
  faFilm,
  faHome,
  faSearch,
  faShuffle,
  faTheaterMasks,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';
import {
  faDiscord,
  faTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';

import { BrowserRouter, Link } from 'react-router-dom';
import { useState } from 'react';

import logo from '../logo-text.png';

export default function Navigation() {
  const [minimized, setMinimized] = useState(true);

  return (
    <div className={styles.navigation} data-min={minimized}>
      <div className={styles.header}>
        <BrowserRouter>
          <Link to={'/'} reloadDocument={true}>
            <div className={styles.logo} title={'AnimeLegacy'}>
              <img src={logo} alt={'AL'} />
            </div>
          </Link>
        </BrowserRouter>
      </div>

      <div className={styles.navList}>
        <BrowserRouter>
          <Link to={'/'} reloadDocument={true} title={'Home'}>
            <div className={styles.navItem}>
              <FontAwesomeIcon icon={faHome} />
              <span>Home</span>
            </div>
          </Link>

          <Link to={'/genres'} reloadDocument={true} title={'Genres'}>
            <div className={styles.navItem}>
              <FontAwesomeIcon icon={faTheaterMasks} />
              <span>Genres</span>
            </div>
          </Link>

          <Link to={'/movies'} reloadDocument={true} title={'Movies'}>
            <div className={styles.navItem}>
              <FontAwesomeIcon icon={faFilm} />
              <span>Movies</span>
            </div>
          </Link>

          <Link to={'/schedule'} reloadDocument={true} title={'Schedule'}>
            <div className={styles.navItem}>
              <FontAwesomeIcon icon={faCalendar} />
              <span>Schedule</span>
            </div>
          </Link>

          <Link to={'/list'} reloadDocument={true} title={'List'}>
            <div className={styles.navItem}>
              <FontAwesomeIcon icon={faBars} />
              <span>List</span>
            </div>
          </Link>

          <Link to={'/search'} reloadDocument={true} title={'Search'}>
            <div className={styles.navItem}>
              <FontAwesomeIcon icon={faSearch} />
              <span>Search</span>
            </div>
          </Link>

          <Link to={'/random'} reloadDocument={true} title={'Random'}>
            <div className={styles.navItem}>
              <FontAwesomeIcon icon={faShuffle} />
              <span>Random</span>
            </div>
          </Link>

          {/* socials */}
          <div className={styles.socials}>
            <Link
              to={{ pathname: '//discord.gg/NgBG7sh42w' }}
              target={'_blank'}
              title={'Discord server'}
            >
              <div className={styles.navItem}>
                <FontAwesomeIcon icon={faDiscord} />
                <span>Discord</span>
              </div>
            </Link>

            <Link
              to={{
                pathname: '//youtube.com/channel/UCelgkaZ7nbNn-xnT3VVOjEQ',
              }}
              target={'_blank'}
              title={'YouTube channel'}
            >
              <div className={styles.navItem}>
                <FontAwesomeIcon icon={faYoutube} />
                <span>YouTube</span>
              </div>
            </Link>

            <Link
              to={{
                pathname: '//twitter.com/uzi79983022',
              }}
              target={'_blank'}
              title={'Twitter'}
            >
              <div className={styles.navItem}>
                <FontAwesomeIcon icon={faTwitter} />
                <span>Twitter</span>
              </div>
            </Link>
          </div>
        </BrowserRouter>
      </div>

      <div className={styles.footer}>
        <div className={styles.toggleMin}>
          <button
            onClick={() => setMinimized(!minimized)}
            title={`Click to ${minimized ? 'expand' : 'minimize'}`}
          >
            <FontAwesomeIcon
              className={styles.icon}
              icon={minimized ? faAnglesRight : faAnglesLeft}
            />
          </button>
        </div>

        <span>
          <code>v1.3.2</code>
        </span>
      </div>
    </div>
  );
}
