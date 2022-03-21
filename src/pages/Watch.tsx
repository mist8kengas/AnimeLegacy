import { useEffect, useState } from 'react';
import { generatePath, Link, useParams } from 'react-router-dom';
import styles from './Watch.module.scss';

import Loading from '../components/Loading';
import urls from '../urls.json';

import axios, { AxiosResponse } from 'axios';

interface GogoResponse {
  request: {
    cache_expires: number;
    cached: boolean;
    slug: string;
  };
}

interface GogoVideo {
  id: number;
  name: string;
  url: string;
}
interface GogoData extends GogoResponse {
  result: {
    id: string;
    name: string;
    slug: {
      current: string;
      next: string | null;
      previous: string | null;
    };
    episode: number;
    image: string;
    type: 'sub' | 'dub';
    video?: {
      anime: GogoVideo;
      doodstream: GogoVideo;
      streamsb: GogoVideo;
      vidcdn: GogoVideo;
      xstreamcdn: GogoVideo;
    };
  };
}
type GogoGenre = [string, string, number];
interface GogoDetails extends GogoResponse {
  result: {
    name: string[];
    slug: string;
    episodes: number;
    image: string;
    status: string;
    released: number;
    genres: GogoGenre[];
    summary: string;
  };
}

interface RecentlyWatchedNode {
  name: string;
  slug: string;
  episode: number;
  slugEpisode: string;
  image: string;
  type: 'sub' | 'dub';
  date_added: number;
}

declare global {
  interface Window {
    hcb_user: any;
  }
}

export default function Watch() {
  const { slug, episode } = useParams();
  const fixedSlug = slug?.replace(/-tv-$/, '');
  const slugEpisode = fixedSlug + '-' + episode;

  const [data, setData] = useState<GogoData>({
    request: {
      cache_expires: 0,
      cached: false,
      slug: '',
    },
    result: {
      id: '',
      name: '',
      slug: {
        current: '',
        next: null,
        previous: null,
      },
      episode: 0,
      image: '',
      type: 'sub',
    },
  });
  const [details, setDetails] = useState<GogoDetails>({
    request: {
      cache_expires: 0,
      cached: false,
      slug: '',
    },
    result: {
      name: [''],
      slug: '',
      episodes: 0,
      image: '',
      status: '',
      released: 0,
      genres: [],
      summary: '',
    },
  });
  const [ready, setReady] = useState(false);

  const [malDetails, setMalDetails] = useState({
    score: 0,
    rating: '',
    url: '',
  });

  // get content
  useEffect(
    () =>
      void axios
        .get(`${urls.api}/anime/${slugEpisode}`)
        .then((response: AxiosResponse<GogoData>) => {
          const { data } = response;
          if (!data || !data.result) return;

          setData(data);
          setReady(true);
        }),
    []
  );

  // get details
  useEffect(() => {
    axios
      .get(`${urls.api}/anime/info/${slug}`)
      .then(async (response: AxiosResponse<GogoDetails>) => {
        const { data } = response;
        if (!data || !data.result) return;

        const malDetailsURL = new URL(
          'https://jikan-api.animeonsen.xyz/v3/search/anime'
        );
        malDetailsURL.searchParams.set('limit', '1');
        malDetailsURL.searchParams.set('q', data.result.name[0]);
        const malDetailsReq = await axios.get(malDetailsURL.href);

        const [detail] = malDetailsReq.data.results;
        const { score, rated, url } = detail;
        setMalDetails({ score, rating: rated, url });

        setDetails(data);
        // setReady(true);
      });
  }, []);

  const [episodeChunk, setEpisodeChunk] = useState(
    details.result.episodes > 100 ? 100 : 0
  );
  var lastChunk = 0;

  if (ready) {
    // set html comment box
    (() => {
      if (!window.hcb_user) window.hcb_user = { PAGE: btoa(slugEpisode || '') };
      const hcbScript = document.createElement('script');
      hcbScript.setAttribute('type', 'text/javascript');
      hcbScript.setAttribute(
        'src',
        'https://www.htmlcommentbox.com/jread?page=' +
          encodeURIComponent(
            window.hcb_user.PAGE || ('' + window.location).replace(/'/g, '%27')
          ).replace('+', '%2B') +
          '&mod=%241%24wq1rdBcg%24whhuJsOZfGV3ZJxzYyLiR%2F' +
          '&opts=16798&num=10&ts=1646597561508'
      );
      document.getElementsByTagName('head')[0].appendChild(hcbScript);
    })();

    // add to recently watched
    if ('localStorage' in window)
      (() => {
        if (!details.result.name[0]) return;
        const recent: RecentlyWatchedNode = {
          name: details.result.name[0],
          slug: slug || '',
          episode: data.result.episode,
          slugEpisode: slugEpisode,
          image: data.result.image,
          type: data.result.type,
          date_added: ~~(Date.now() / 1e3),
        };

        const recentlyWatched = JSON.parse(
          window.localStorage.getItem('al-rw0') || '[]'
        );

        if (
          recentlyWatched
            .map((i: RecentlyWatchedNode) => i.slugEpisode)
            .indexOf(recent.slugEpisode) === -1
        ) {
          recentlyWatched.push(recent);
          if (recentlyWatched.length > 10) recentlyWatched.shift();
          window.localStorage.setItem(
            'al-rw0',
            JSON.stringify(recentlyWatched)
          );
        }
      })();

    return (
      <div className={styles.content}>
        <div className={styles.videoContainer}>
          <div className={styles.header}>
            <h1>
              {/* data.result.name */}
              {(/(.*)(?: Episode(.*))/.exec(data.result.name) || [])[1]}
              &nbsp;
              <i className={styles.episode}>
                Episode {episode?.split('episode-')[1]}
              </i>
            </h1>
          </div>

          <div className={styles.embed}>
            <iframe
              src={data.result.video?.anime.url}
              frameBorder={0}
              scrolling={'no'}
              allowFullScreen={true}
            />
          </div>

          <div className={styles.controls}>
            <div className={styles.episode}>
              <div>
                {(data.result.slug.previous && (
                  <Link
                    to={generatePath('/watch/:slug/:episode', {
                      slug,
                      episode: `episode-${data.result.episode - 1}`,
                    })}
                    target={'_parent'}
                  >
                    <button>
                      <span>Previous</span>
                    </button>
                  </Link>
                )) || (
                  <button disabled={!data.result.slug.previous}>
                    <span>Previous</span>
                  </button>
                )}
              </div>

              <div>
                {(data.result.slug.next && (
                  <Link
                    to={generatePath('/watch/:slug/:episode', {
                      slug,
                      episode: `episode-${data.result.episode + 1}`,
                    })}
                    target={'_parent'}
                  >
                    <button>
                      <span>Next</span>
                    </button>
                  </Link>
                )) || (
                  <button disabled={!data.result.slug.next}>
                    <span>Next</span>
                  </button>
                )}
              </div>

              <div>
                {+(episode?.split('episode-')[1] || '1') <
                  details.result.episodes &&
                  +(episode?.split('episode-')[1] || '1') !==
                    details.result.episodes - 1 && (
                    <Link
                      to={generatePath('/watch/:slug/:episode', {
                        slug,
                        episode: `episode-${details.result.episodes}`,
                      })}
                      target={'_parent'}
                    >
                      <button>
                        <span>Latest</span>
                      </button>
                    </Link>
                  )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.image}>
            <img src={details.result.image} width={225} height={350} />
          </div>
          <div className={styles.text}>
            <span className={styles.title} title={details.result.name[0]}>
              {details.result.name[0]}
            </span>
            <span className={styles.episode}>
              {episode?.split('episode-')[1]} / {details.result.episodes}
            </span>
            <span className={styles.status}>
              {details.result.status === 'completed'
                ? 'Finished Airing'
                : 'Airing'}
            </span>
            <span className={styles.released}>{details.result.released}</span>

            <span className={styles.score}>{malDetails.score}</span>
            <span className={styles.rating}>{malDetails.rating}</span>

            <span className={styles.genres}>
              {details.result.genres.map((genre, i) => (
                <span key={i}>
                  <Link
                    to={generatePath('/genre/:genre', {
                      genre: genre[1],
                    })}
                    title={genre[0]}
                  >
                    {genre[0]}
                  </Link>
                  {details.result.genres.length - 1 > i && ', '}
                </span>
              ))}
            </span>
            <span className={styles.summary}>{details.result.summary}</span>

            <span className={styles.viewMal}>
              <a
                href={malDetails.url}
                target={'_blank'}
                title={'View on MyAnimeList'}
              >
                View on MyAnimeList
              </a>
            </span>
          </div>
        </div>

        <div className={styles.episodesContainer}>
          <div className={styles.headerContent}>
            <h1>Episodes</h1>
          </div>

          <div className={styles.episodes}>
            <div className={styles.episodeChunks}>
              {details.result.episodes < 100 ? (
                <button className={styles.chunk} disabled={true}>
                  <span>0 - {details.result.episodes}</span>
                </button>
              ) : (
                new Array(details.result.episodes).fill(true).map((_, i) => {
                  // split into chunks of 100 size max
                  if (i % 100 === 0 && i != 0)
                    return (
                      <button
                        className={styles.chunk}
                        onClick={() => setEpisodeChunk(i)}
                        key={i}
                        disabled={episodeChunk === i}
                      >
                        <span>
                          {lastChunk} -{' '}
                          {i + 100 > details.result.episodes
                            ? details.result.episodes
                            : i}
                        </span>
                        {(() => {
                          lastChunk =
                            i + 100 > details.result.episodes
                              ? details.result.episodes
                              : i;
                        })()}
                      </button>
                    );
                })
              )}
            </div>

            <div className={styles.episodeButtons}>
              {new Array(details.result.episodes).fill(true).map((_, i) => {
                if (i < episodeChunk - 100 || i > episodeChunk) {
                  if (
                    i < episodeChunk ||
                    episodeChunk + 100 < details.result.episodes
                  )
                    return;
                }
                if (+(episode?.split('episode-')[1] || '1') == i + 1)
                  return (
                    <div
                      className={styles.episodeActive}
                      title={'Current episode'}
                      key={i}
                    >
                      <div className={styles.episode}>
                        <div className={styles.text}>
                          <span>{i + 1}</span>
                        </div>
                      </div>
                    </div>
                  );
                else
                  return (
                    <Link
                      className={styles.episodeHref}
                      to={generatePath('/watch/:slug/:episode', {
                        slug,
                        episode: `episode-${i + 1}`,
                      })}
                      target={'_parent'}
                      title={`Watch ${details.result.name[0]} Episode ${i + 1}`}
                      key={i}
                    >
                      <div className={styles.episode}>
                        <div className={styles.text}>
                          <span>{i + 1}</span>
                        </div>
                      </div>
                    </Link>
                  );
              })}
            </div>
          </div>
        </div>

        <div className={styles.comments}>
          <div className={styles.headerContent}>
            <h1>Comments</h1>
          </div>

          <div id='HCB_comment_box'>Comment Box is loading...</div>
          <link
            rel='stylesheet'
            type='text/css'
            href='https://www.htmlcommentbox.com/static/skins/bootstrap/twitter-bootstrap.css?v=0'
          />
          <script type='text/javascript' id='hcb' />
        </div>
      </div>
    );
  } else return <Loading />;
}
