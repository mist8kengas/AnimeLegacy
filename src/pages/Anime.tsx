import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import styles from './Recent.module.scss';

import Loading from '../components/Loading';

import urls from '../urls.json';

import axios, { AxiosResponse } from 'axios';

interface GogoResponse {
  request: {
    cache_expires: number;
    cached: boolean;
    page: number;
    type: number;
  };
}

interface GogoRecentNode {
  name: string;
  slug: string;
  episode: number;
  image: string;
}
interface GogoTrendingNode extends GogoRecentNode {
  type: 'sub' | 'dub';
}
interface GogoRecent extends GogoResponse {
  result: GogoRecentNode[] | GogoTrendingNode[];
}

function App() {
  const [ready, setReady] = useState(false);
  const [recent, setData] = useState(new Array());
  const [recentPage, setRecentPage] = useState(1);
  const [recentType, setRecentType] = useState(1);
  const [intersectionRef, inView] = useInView({ threshold: 0.1 });

  const [trending, setTrending] = useState(new Array());

  const [render, setRender] = useState(0);

  // regular request
  useEffect(
    () =>
      void axios
        .get(`${urls.api}/anime/recent?page=${recentPage}&type=${recentType}`)
        .then((response: AxiosResponse<GogoRecent>) => {
          const { data } = response;
          if (!data) return;
          const newData = recent;
          newData.push(...data.result);
          setData(newData);

          setReady(true);
          setRender(Math.random());
        }),
    [recentPage]
  );

  // new request
  useMemo(() => {
    setReady(false);
    return void axios
      .get(`${urls.api}/anime/recent?page=${recentPage}&type=${recentType}`)
      .then((response: AxiosResponse<GogoRecent>) => {
        const { data } = response;
        if (!data) return;
        setData(data.result);

        if (recentPage) setReady(true);
      });
  }, [recentType]);

  // trending page
  useMemo(() => {
    // setReady(false);
    return void axios
      .get(`${urls.api}/anime/recent/trending`)
      .then((response: AxiosResponse<GogoRecent>) => {
        const { data } = response;
        if (!data) return;
        setTrending(data.result);

        // if (recentPage) setReady(true);
      });
  }, [recentType]);

  // infinite scrolling
  useEffect(
    () => void (inView && recentPage < 24 && setRecentPage(recentPage + 1)),
    [inView]
  );

  if (ready && render)
    return (
      <div className={styles.content}>
        {/* recent */}
        <div>
          <div className={styles.header}>
            <h1>
              Recent
              <select
                onChange={(e) => setRecentType(+e.target.value)}
                title={'Click to change content type'}
                defaultValue={recentType}
              >
                <option value={1}>Subbed</option>
                <option value={2}>Dubbed</option>
                <option value={3}>Chinese</option>
              </select>
            </h1>
          </div>

          <div className={styles.recentContent}>
            {recent.map((node: GogoRecentNode, i) => {
              const { name, slug: slugEpisode, episode, image } = node;
              const [, slug] =
                /^(.*)(?:-episode-(?:.*))$/.exec(slugEpisode) || [];

              if (!slug) {
                console.warn(
                  '[Recent.tsx]',
                  'ID for',
                  slugEpisode,
                  'is undefined'
                );
                return;
              }

              const watchHref = `/watch/${slug}/episode-${episode}`;
              return (
                <Link
                  to={watchHref}
                  key={i}
                  ref={recent.length - 1 - 3 === i ? intersectionRef : null}
                >
                  <div
                    className={styles.recentNode}
                    title={`Watch ${name} Episode ${episode}`}
                  >
                    <div className={styles.image}>
                      <img
                        src={image}
                        alt={name}
                        loading={recentPage > 1 ? 'lazy' : 'eager'}
                      />
                      <div
                        className={styles.type}
                        data-type={recentType === 2 ? 'dub' : 'sub'}
                      >
                        <span>{recentType === 2 ? 'DUB' : 'SUB'}</span>
                      </div>
                    </div>
                    <div className={styles.text}>
                      <span className={styles.title} title={name}>
                        {name}
                      </span>
                      <span className={styles.episode}>Episode {episode}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {(() => {
              if (recentPage < 23)
                return (
                  <div className={styles.recentNodePlaceholder}>
                    <span>Loading</span>
                  </div>
                );
            })()}
          </div>
        </div>
      </div>
    );
  else return <Loading />;
}

export default App;
