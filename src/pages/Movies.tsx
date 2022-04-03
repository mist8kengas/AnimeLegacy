import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import styles from './Movies.module.scss';

import Loading from '../components/Loading';

import urls from '../urls.json';

import axios, { AxiosResponse } from 'axios';

interface GogoResponse {
  request: {
    cache_expires: number;
    cached: boolean;
    page: number;
    type: number;
    list: string;
  };
}

interface GogoMovieNode {
  name: string;
  slug: string;
  image: string;
}
interface GogoMovie extends GogoResponse {
  result: { next: boolean; data: GogoMovieNode[] };
}

function MovieResult(init_list: string, page: number = 1) {
  const [ready, setReady] = useState(false);
  const [list, setList] = useState(init_list);
  const [result, setData] = useState({
    next: false,
    list: '',
    data: new Array(),
  });
  const [resultPage, setResultPage] = useState(page);
  const [intersectionRef, inView] = useInView({ threshold: 0.1 });

  const [render, setRender] = useState(0);

  // regular request
  useEffect(() => {
    if (result.list != list) setReady(false);
    axios
      .get(`${urls.api}/anime/list?page=${resultPage}&type=2&list=${list}`)
      .then((response: AxiosResponse<GogoMovie>) => {
        const { data } = response;
        if (!data) return;

        const newData =
          result.list != list
            ? {
                next: false,
                list: list,
                data: new Array(),
              }
            : result;
        newData.data.push(...data.result.data);
        newData.next = data.result.next;
        setData(newData);

        setReady(true);
        setRender(Math.random());
      });
  }, [resultPage, list]);

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
            No results found for <i>{list}</i>
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
              Movies
              {/* <select
                onChange={(e) => setList(e.target.value)}
                defaultValue={list}
              >
                <option value='All'>All</option>
                <option value='0'>#</option>
                <option value='A'>A</option>
                <option value='B'>B</option>
                <option value='C'>C</option>
                <option value='D'>D</option>
                <option value='E'>E</option>
                <option value='F'>F</option>
                <option value='G'>G</option>
                <option value='H'>H</option>
                <option value='I'>I</option>
                <option value='J'>J</option>
                <option value='K'>K</option>
                <option value='L'>L</option>
                <option value='M'>M</option>
                <option value='N'>N</option>
                <option value='O'>O</option>
                <option value='P'>P</option>
                <option value='Q'>Q</option>
                <option value='R'>R</option>
                <option value='S'>S</option>
                <option value='T'>T</option>
                <option value='U'>U</option>
                <option value='V'>V</option>
                <option value='W'>W</option>
                <option value='X'>X</option>
                <option value='Y'>Y</option>
                <option value='Z'>Z</option>
              </select> */}
            </h1>
            <div className={styles.lists}>
              <button onClick={() => setList('All')} disabled={list === 'All'}>
                <span>All</span>
              </button>

              <button onClick={() => setList('0')} disabled={list === '0'}>
                <span>0-9</span>
              </button>

              <button onClick={() => setList('A')} disabled={list === 'A'}>
                <span>A</span>
              </button>

              <button onClick={() => setList('B')} disabled={list === 'B'}>
                <span>B</span>
              </button>

              <button onClick={() => setList('C')} disabled={list === 'C'}>
                <span>C</span>
              </button>

              <button onClick={() => setList('D')} disabled={list === 'D'}>
                <span>D</span>
              </button>

              <button onClick={() => setList('E')} disabled={list === 'E'}>
                <span>E</span>
              </button>

              <button onClick={() => setList('F')} disabled={list === 'F'}>
                <span>F</span>
              </button>

              <button onClick={() => setList('G')} disabled={list === 'G'}>
                <span>G</span>
              </button>

              <button onClick={() => setList('H')} disabled={list === 'H'}>
                <span>H</span>
              </button>

              <button onClick={() => setList('I')} disabled={list === 'I'}>
                <span>I</span>
              </button>

              <button onClick={() => setList('J')} disabled={list === 'J'}>
                <span>J</span>
              </button>

              <button onClick={() => setList('K')} disabled={list === 'K'}>
                <span>K</span>
              </button>

              <button onClick={() => setList('L')} disabled={list === 'L'}>
                <span>L</span>
              </button>

              <button onClick={() => setList('M')} disabled={list === 'M'}>
                <span>M</span>
              </button>

              <button onClick={() => setList('N')} disabled={list === 'N'}>
                <span>N</span>
              </button>

              <button onClick={() => setList('O')} disabled={list === 'O'}>
                <span>O</span>
              </button>

              <button onClick={() => setList('P')} disabled={list === 'P'}>
                <span>P</span>
              </button>

              <button onClick={() => setList('Q')} disabled={list === 'Q'}>
                <span>Q</span>
              </button>

              <button onClick={() => setList('R')} disabled={list === 'R'}>
                <span>R</span>
              </button>

              <button onClick={() => setList('S')} disabled={list === 'S'}>
                <span>S</span>
              </button>

              <button onClick={() => setList('T')} disabled={list === 'T'}>
                <span>T</span>
              </button>

              <button onClick={() => setList('U')} disabled={list === 'U'}>
                <span>U</span>
              </button>

              <button onClick={() => setList('V')} disabled={list === 'V'}>
                <span>V</span>
              </button>

              <button onClick={() => setList('W')} disabled={list === 'W'}>
                <span>W</span>
              </button>

              <button onClick={() => setList('X')} disabled={list === 'X'}>
                <span>X</span>
              </button>

              <button onClick={() => setList('Y')} disabled={list === 'Y'}>
                <span>Y</span>
              </button>

              <button onClick={() => setList('Z')} disabled={list === 'Z'}>
                <span>Z</span>
              </button>
            </div>
          </div>

          <div className={styles.movieContent}>
            {result.data.map((node: GogoMovieNode, i) => {
              const { name, slug, image } = node;

              if (!slug) {
                console.warn('[Movies.tsx]', 'ID for', slug, 'is undefined');
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
                    className={styles.movieNode}
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
                  <div className={styles.movieNodePlaceholder}>
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

function Movies() {
  const windowUrl = new URL(window.location.href);
  const list = windowUrl.searchParams.get('l') || false;
  const page = Math.max(1, +(windowUrl.searchParams.get('p') || '1'));

  return MovieResult(list || 'All', page);
}

export default Movies;
