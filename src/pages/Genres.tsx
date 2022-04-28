import styles from './Genres.module.scss';

import genres from '../genres.json';
import { Link } from 'react-router-dom';

export default function Genres() {
  return (
    <div className={styles.content}>
      <div>
        <div className={styles.header}>
          <h1>Genres</h1>
        </div>

        <div className={styles.genres}>
          {Object.values(genres).map((genre, i) => {
            const [slug, name, description] = genre;
            return (
              <Link to={`/genre/${slug}`} key={i}>
                <div className={styles.genre}>
                  {/* <div className={styles.image}>
                    <img src={`/media/image/genre/${slug}.jpg`} alt={name} />
                  </div> */}
                  <div className={styles.text}>
                    <span className={styles.title}>{name}</span>
                    <span className={styles.description}>{description}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
