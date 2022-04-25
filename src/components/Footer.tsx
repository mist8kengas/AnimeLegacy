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
  return (
    <footer>
      <div className={styles.footer}>
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
