import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import styles from './Search.module.scss';

import Loading from '../components/Loading';

import urls from '../urls.json';

import axios, { AxiosResponse } from 'axios';

// fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface GogoResponse {
  request: {
    cache_expires: number;
    cached: boolean;
    page: number;
    type: number;
  };
}

interface GogoSearchNode {
  name: string;
  slug: string;
  image: string;
}
interface GogoSearch extends GogoResponse {
  result: { next: boolean; data: GogoSearchNode[] };
}

function SearchResult(query: string, page: number = 1) {
  const [ready, setReady] = useState(false);
  const [result, setData] = useState({
    next: false,
    data: new Array(),
  });
  const [resultPage, setResultPage] = useState(page);
  const [intersectionRef, inView] = useInView({ threshold: 0.1 });

  const [render, setRender] = useState(0);

  // regular request
  useEffect(
    () =>
      void axios
        .get(`${urls.api}/anime/search?query=${query}&page=${resultPage}`)
        .then((response: AxiosResponse<GogoSearch>) => {
          const { data } = response;
          if (!data) return;
          const newData = result;
          newData.data.push(...data.result.data);
          newData.next = data.result.next;
          setData(newData);

          setReady(true);
          setRender(Math.random());
        }),
    [resultPage]
  );

  // infinite scrolling
  useEffect(
    () => void (inView && resultPage < 24 && setResultPage(resultPage + 1)),
    [inView]
  );

  if (ready && render && !result.data.length)
    return (
      <div className={styles.noContent}>
        <div>
          <h1>
            No results found for <i>{query}</i>
          </h1>
        </div>
      </div>
    );
  else if (ready && render)
    return (
      <div className={styles.content}>
        {/* result */}
        <div>
          <div className={styles.header}>
            <h1>
              Search result for <i>{query}</i>
            </h1>
          </div>

          <div className={styles.searchContent}>
            {result.data.map((node: GogoSearchNode, i) => {
              const { name, slug, image } = node;

              if (!slug) {
                console.warn('[Search.tsx]', 'ID for', slug, 'is undefined');
                return;
              }

              const watchHref = `/watch/${slug}/episode-1`;
              return (
                <Link
                  to={watchHref}
                  key={i}
                  ref={
                    result.data.length - 1 - 3 === i ? intersectionRef : null
                  }
                >
                  <div
                    className={styles.searchNode}
                    title={`Watch ${name} Episode 1`}
                  >
                    <div className={styles.image}>
                      <img
                        src={image}
                        alt={name}
                        loading={resultPage > 1 ? 'lazy' : 'eager'}
                      />
                      <div
                        className={styles.type}
                        data-type={
                          slug.split('-').indexOf('dub') > 0 ? 'dub' : 'sub'
                        }
                      >
                        <span>
                          {slug.split('-').indexOf('dub') > 0 ? 'DUB' : 'SUB'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.text}>
                      <span className={styles.title} title={name}>
                        {name}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {(() => {
              if (result.next)
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

function App() {
  const windowUrl = new URL(window.location.href);
  const query = windowUrl.searchParams.get('q') || false;
  const page = Math.max(1, +(windowUrl.searchParams.get('p') || '1'));

  if (query) return SearchResult(query, page);
  else
    return (
      <div className={styles.content} data-none={true}>
        <div>
          <div className={styles.header}>
            <h1>
              Search <i>{query}</i>
            </h1>
          </div>

          <div className={styles.searchForm}>
            <form method={'get'}>
              <div className={styles.searchInput}>
                <input
                  className={styles.searchBar}
                  name={'q'}
                  type={'text'}
                  placeholder={'Search anime'}
                  autoFocus={true}
                  required={true}
                />
                <button className={styles.searchButton} type={'submit'}>
                  <FontAwesomeIcon className={styles.icon} icon={faSearch} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
}

export default App;
