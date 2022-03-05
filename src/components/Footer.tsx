import styles from './Footer.module.scss';

// fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { BrowserRouter, Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className={styles.footer}>
        {/* <div className={styles.title}>
          <span>AnimeLegacy {new Date().getFullYear()}</span>
        </div> */}

        <div className={styles.socials}>
          <BrowserRouter>
            <div>
              <Link
                to={{ pathname: '//discord.gg/NgBG7sh42w' }}
                title={'Discord server'}
              >
                <FontAwesomeIcon className={styles.icon} icon={faDiscord} />
              </Link>
            </div>

            <div>
              <Link
                to={{
                  pathname: '//youtube.com/channel/UCX9wKHtN2sHCx50h9lDvTGQ',
                }}
                title={'YouTube channel'}
              >
                <FontAwesomeIcon className={styles.icon} icon={faYoutube} />
              </Link>
            </div>
          </BrowserRouter>
        </div>
      </div>
    </footer>
  );
}
