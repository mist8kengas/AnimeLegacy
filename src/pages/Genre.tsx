import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import styles from './Genre.module.scss';

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

interface GogoGenreNode {
  name: string;
  slug: string;
  image: string;
  type: 'sub' | 'dub';
}
interface GogoExtendedNode extends GogoGenreNode {
  name_english?: string;
}
interface GogoGenre extends GogoResponse {
  result: { next: boolean; data: GogoGenreNode[] };
}

import genres from '../genres.json';
type Genre =
  | 'action'
  | 'adventure'
  | 'cars'
  | 'comedy'
  | 'crime'
  | 'dementia'
  | 'demons'
  | 'drama'
  | 'dub'
  | 'ecchi'
  | 'family'
  | 'fantasy'
  | 'game'
  | 'gender-bender'
  | 'gourmet'
  | 'harem'
  | 'historical'
  | 'horror'
  | 'josei'
  | 'kids'
  | 'magic'
  | 'martial-arts'
  | 'mecha'
  | 'military'
  | 'music'
  | 'mystery'
  | 'parody'
  | 'police'
  | 'psychological'
  | 'romance'
  | 'samurai'
  | 'school'
  | 'sci-fi'
  | 'seinen'
  | 'shoujo'
  | 'shoujo-ai'
  | 'shounen'
  | 'shounen-ai'
  | 'slice-of-life'
  | 'space'
  | 'sports'
  | 'super-power'
  | 'supernatural'
  | 'suspense'
  | 'thriller'
  | 'vampire'
  | 'work-life'
  | 'yaoi'
  | 'yuri';
interface GenreParams extends Record<string, string | undefined> {
  genre: Genre;
}

export default function Genre() {
  const { genre = 'action' } = useParams<GenreParams>();
  const [ready, setReady] = useState(false);
  const [result, setData] = useState({
    next: false,
    data: new Array(),
  });
  const [resultPage, setResultPage] = useState(1);
  const [intersectionRef, inView] = useInView({ threshold: 0.1 });

  const [render, setRender] = useState(0);

  const genreData = genres[genre];

  const [language, setLanguage] = useState<'native' | 'english' | string>(
    window.localStorage.getItem('al-slang') || 'native'
  );
  // change to english title
  const processContent = async (content: GogoGenreNode[]) =>
    await Promise.all<Promise<GogoExtendedNode>[]>(
      content.map(
        (item) =>
          new Promise(async (resolve, reject) => {
            const getMalId = async () => {
              const malDetailsURL = new URL(
                'https://jikan-api.animeonsen.xyz/v3/search/anime'
              );
              malDetailsURL.searchParams.set('limit', '1');
              malDetailsURL.searchParams.set('q', item.name);
              const malDetailsReq = await axios
                .get(malDetailsURL.href)
                .catch(() => undefined);

              if (malDetailsReq?.data.results) {
                const [data] = malDetailsReq.data.results;
                return data.mal_id as number | undefined;
              }
            };

            const malId = await getMalId();
            if (!malId) {
              console.error('[!content-getMalId]', item);
              return resolve(item);
            }

            const malDetailsURL = new URL(
              `https://jikan-api.animeonsen.xyz/v3/anime/${malId}`
            );
            const malDetailsReq = await axios
              .get(malDetailsURL.href)
              .catch(() => undefined);

            if (!malDetailsReq) return resolve(item);

            const { data } = malDetailsReq;

            // console.log(data);
            return resolve({
              ...item,
              name_english: data.title_english,
            });
          })
      )
    );

  // regular request
  useEffect(() => {
    if (!genreData) return setReady(true);
    axios
      .get(`${urls.api}/anime/genre/${genre}?page=${resultPage}`)
      .then(async (response: AxiosResponse<GogoGenre>) => {
        const { data } = response;
        if (!data) return;

        const newData = result;
        newData.data.push(...data.result.data);
        newData.data = await processContent(newData.data);
        newData.next = data.result.next;
        setData(newData);

        setReady(true);
        setRender(Math.random());
      });
  }, [resultPage]);

  // infinite scrolling
  useEffect(
    () => void (inView && result.next && setResultPage(resultPage + 1)),
    [inView]
  );

  if (ready && !result.data.length)
    return (
      <div className={styles.noContent}>
        <div>
          <h1>
            No content found for <i>{genre}</i>
          </h1>
        </div>
      </div>
    );
  else if (ready && render && genreData) {
    const [, name] = genreData;

    return (
      <>
        {/* site language */}
        <div className={styles.siteLanguage}>
          <div className={styles.floatieContainer}>
            <div className={styles.label}>
              <span>Anime Name</span>
            </div>
            <div className={styles.toggleContainer}>
              <button
                onClick={() => setLanguage('native')}
                disabled={language === 'native'}
              >
                <span>Native</span>
              </button>

              <button
                onClick={() => setLanguage('english')}
                disabled={language === 'english'}
              >
                <span>English</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {/* result */}
          <div>
            <div className={styles.header}>
              <h1>
                Genre <i>{name}</i>
              </h1>
            </div>

            <div className={styles.genreContent}>
              {result.data.map((node: GogoExtendedNode, i) => {
                const { name: name_native, name_english, slug, image } = node;
                const name =
                  language == 'native'
                    ? name_native
                    : name_english || name_native;

                if (!slug) {
                  console.warn('[Genre.tsx]', 'ID for', slug, 'is undefined');
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
                    <div className={styles.genreNode} title={`Watch ${name}`}>
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
                    <div className={styles.genreNodePlaceholder}>
                      <span>Loading</span>
                    </div>
                  );
              })()}
            </div>
          </div>
        </div>
      </>
    );
  } else return <Loading />;
}
