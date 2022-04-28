import styles from './Footer.module.scss';

// fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDiscord,
  faTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { BrowserRouter, Link } from 'react-router-dom';

export default function Footer() {
  const setList = (string: string) => {};
  return (
    <footer>
      <div className={styles.footer}>
        <div className={styles.azList}>
          <div className={styles.label}>
            <span>
              <b>A-Z List</b>
            </span>
            <span>Search anime by letter</span>
          </div>

          <div className={styles.lists}>
            <button onClick={() => setList('All')}>
              <span>All</span>
            </button>

            <button onClick={() => setList('0')}>
              <span>0-9</span>
            </button>

            <button onClick={() => setList('A')}>
              <span>A</span>
            </button>

            <button onClick={() => setList('B')}>
              <span>B</span>
            </button>

            <button onClick={() => setList('C')}>
              <span>C</span>
            </button>

            <button onClick={() => setList('D')}>
              <span>D</span>
            </button>

            <button onClick={() => setList('E')}>
              <span>E</span>
            </button>

            <button onClick={() => setList('F')}>
              <span>F</span>
            </button>

            <button onClick={() => setList('G')}>
              <span>G</span>
            </button>

            <button onClick={() => setList('H')}>
              <span>H</span>
            </button>

            <button onClick={() => setList('I')}>
              <span>I</span>
            </button>

            <button onClick={() => setList('J')}>
              <span>J</span>
            </button>

            <button onClick={() => setList('K')}>
              <span>K</span>
            </button>

            <button onClick={() => setList('L')}>
              <span>L</span>
            </button>

            <button onClick={() => setList('M')}>
              <span>M</span>
            </button>

            <button onClick={() => setList('N')}>
              <span>N</span>
            </button>

            <button onClick={() => setList('O')}>
              <span>O</span>
            </button>

            <button onClick={() => setList('P')}>
              <span>P</span>
            </button>

            <button onClick={() => setList('Q')}>
              <span>Q</span>
            </button>

            <button onClick={() => setList('R')}>
              <span>R</span>
            </button>

            <button onClick={() => setList('S')}>
              <span>S</span>
            </button>

            <button onClick={() => setList('T')}>
              <span>T</span>
            </button>

            <button onClick={() => setList('U')}>
              <span>U</span>
            </button>

            <button onClick={() => setList('V')}>
              <span>V</span>
            </button>

            <button onClick={() => setList('W')}>
              <span>W</span>
            </button>

            <button onClick={() => setList('X')}>
              <span>X</span>
            </button>

            <button onClick={() => setList('Y')}>
              <span>Y</span>
            </button>

            <button onClick={() => setList('Z')}>
              <span>Z</span>
            </button>
          </div>
        </div>

        <div className={styles.disclaimer}>
          <span>
            Disclaimer: This site does not store any files on its server. All
            contents are provided by non-affiliated third parties. AnimeLegacy
            &copy; 2022
          </span>
        </div>

        <div className={styles.socials}>
          <BrowserRouter>
            <div>
              <Link
                to={{ pathname: '//discord.gg/NgBG7sh42w' }}
                target={'_blank'}
                title={'Discord server'}
              >
                <FontAwesomeIcon className={styles.icon} icon={faDiscord} />
              </Link>
            </div>

            <div>
              <Link
                to={{
                  pathname: '//youtube.com/channel/UCelgkaZ7nbNn-xnT3VVOjEQ',
                }}
                target={'_blank'}
                title={'YouTube channel'}
              >
                <FontAwesomeIcon className={styles.icon} icon={faYoutube} />
              </Link>
            </div>

            <div>
              <Link
                to={{
                  pathname: '//twitter.com/uzi79983022',
                }}
                target={'_blank'}
                title={'Twitter'}
              >
                <FontAwesomeIcon className={styles.icon} icon={faTwitter} />
              </Link>
            </div>
          </BrowserRouter>
        </div>
      </div>
    </footer>
  );
}
