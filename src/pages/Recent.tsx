import { useEffect, useMemo, useState } from 'react';
import { generatePath, Link } from 'react-router-dom';
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

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import featured from '../featured.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faPlay } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [ready, setReady] = useState(false);
  const [recent, setData] = useState(new Array());
  const [recentPage, setRecentPage] = useState(1);
  const [recentType, setRecentType] = useState(1);
  const [intersectionRef, inView] = useInView({ threshold: 0.1 });

  const [trending, setTrending] = useState(new Array());

  const [topData, setTopData] = useState(new Array());
  // day - week - month
  const [topTime, setTopTime] = useState('day');

  const [render, setRender] = useState(0);

  // recently watched
  interface RecentlyWatchedNode {
    name: string;
    slug: string;
    episode: number;
    slugEpisode: string;
    image: string;
    type: 'sub' | 'dub';
    date_added: number;
  }
  const recentlyWatched: RecentlyWatchedNode[] = JSON.parse(
    window.localStorage.getItem('al-rw0') || '[]'
  );

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

  // top section
  useEffect(() => {
    return void axios
      .get(`${urls.api}/anime/top/${topTime}`)
      .then((response: AxiosResponse<GogoRecent>) => {
        const { data } = response;
        if (!data) return;
        setTopData(data.result);
      });
  }, [topTime]);

  // infinite scrolling
  useEffect(
    () => void (inView && recentPage < 24 && setRecentPage(recentPage + 1)),
    [inView]
  );

  // watch trailer pop-up
  const [showTrailer, toggleTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState('');
  function watchTrailer(url: string) {
    console.log('watching trailer:', url);
    toggleTrailer(true);
    setTrailerUrl(url);
  }
  useEffect(() => {
    !showTrailer && setTrailerUrl('');
  }, [showTrailer]);

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState(<></>);
  const [tooltipPos, setTooltipPos] = useState([0, 0]);

  var tooltipMoveEvent;
  const requestController = new AbortController();

  if (ready)
    // ads
    (() => {
      ((s: HTMLScriptElement, u: string, z: number, p: HTMLElement) => {
        (s.src = u), s.setAttribute('data-zone', '' + z), p.appendChild(s);
      })(
        document.createElement('script'),
        'https://inklinkor.com/tag.min.js',
        5499427,
        document.body || document.documentElement
      );
    })();
  if (ready && render)
    return (
      <>
        {/* hover details pop-up */}
        <div
          className={styles.tooltipContent}
          hidden={!showTooltip}
          style={{
            top: tooltipPos[0],
            left: tooltipPos[1],
          }}
          children={tooltipContent}
        />

        {/* trailer pop-up */}
        <div className={styles.trailerContent} hidden={!showTrailer}>
          <div
            className={styles.dismiss}
            onClick={() => toggleTrailer(false)}
          />
          <div className={styles.watchTrailer}>
            <iframe
              src={(trailerUrl && `${trailerUrl}?autoplay=true`) || ''}
              width={640}
              height={360}
              frameBorder={'0'}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen={true}
            />
          </div>
        </div>

        {/* featured */}
        <div className={styles.featuredContent}>
          <Swiper
            className={styles.carousel}
            modules={[Navigation, Pagination, Autoplay]}
            navigation={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5e3 }}
            loop={true}
          >
            {featured.map((item, i) => {
              const { name, watch, image, description, trailerUrl } = item;
              return (
                <SwiperSlide key={i}>
                  <div className={styles.item}>
                    <div className={styles.image}>
                      <img
                        src={image}
                        alt={name}
                        loading={recentPage > 1 ? 'lazy' : 'eager'}
                      />
                    </div>

                    <div className={styles.text}>
                      <div className={styles.textContent}>
                        <span className={styles.title}>{name}</span>
                        <span className={styles.description}>
                          {description}
                        </span>
                      </div>

                      <div className={styles.watchNow}>
                        <div>
                          <Link to={watch}>
                            <button
                              className={styles.watchButton}
                              title={`Watch ${name}`}
                            >
                              <div>
                                <FontAwesomeIcon icon={faPlay} />
                              </div>
                              <div>
                                <span>Watch</span>
                              </div>
                            </button>
                          </Link>
                        </div>

                        {trailerUrl && (
                          <div>
                            <button
                              className={styles.watchButton}
                              title={`Watch ${name} trailer`}
                              onClick={() => watchTrailer(trailerUrl)}
                            >
                              <div>
                                <FontAwesomeIcon icon={faFilm} />
                              </div>
                              <div>
                                <span>Trailer</span>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        <div className={styles.content}>
          <div>
            {/* recently watched */}
            {!!(recentlyWatched || []).length && (
              <div>
                <div className={styles.header}>
                  <h1>Recently Watched</h1>
                </div>

                <div className={styles.rwContent}>
                  {recentlyWatched
                    .sort((x, y) => (x.date_added > y.date_added && -1) || 0)
                    .map((node, i) => {
                      const { name, slug, episode, image } = node;

                      if (!slug) {
                        console.warn(
                          '[Recent.tsx]',
                          'ID for',
                          slug,
                          'is undefined'
                        );
                        return;
                      }

                      const watchHref = `/watch/${slug}/episode-${episode}`;
                      return (
                        <Link
                          className={styles.hrefNode}
                          to={watchHref}
                          key={i}
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
                                data-type={node.type}
                              >
                                <span>{node.type.toUpperCase()}</span>
                              </div>
                            </div>
                            <div className={styles.text}>
                              <span className={styles.title} title={name}>
                                {name}
                              </span>
                              <span className={styles.episode}>
                                Episode {episode}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </div>
            )}

            {/* trending */}
            <div>
              <div className={styles.header}>
                <h1>
                  Recent <i>Trending</i>
                </h1>
              </div>

              <div className={styles.trendingContent}>
                {trending.map((node: GogoTrendingNode, i) => {
                  const { name, slug, episode, image } = node;

                  if (!slug) {
                    console.warn(
                      '[Recent.tsx]',
                      'ID for',
                      slug,
                      'is undefined'
                    );
                    return;
                  }

                  const watchHref = `/watch/${slug}/episode-${episode}`;
                  return (
                    <Link className={styles.hrefNode} to={watchHref} key={i}>
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
                          <div className={styles.type} data-type={node.type}>
                            <span>{node.type.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className={styles.text}>
                          <span className={styles.title} title={name}>
                            {name}
                          </span>
                          <span className={styles.episode}>
                            Episode {episode}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

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
                      onMouseEnter={(e) => {
                        console.debug('[hover:on]', `${slug}-${episode}`, e);
                        setTooltipPos([e.clientY, e.clientX]);
                        setShowTooltip(true);
                        setTooltipContent(
                          <div className={styles.text} data-loading='true'>
                            <span>Loading</span>
                          </div>
                        );

                        tooltipMoveEvent = e.target.addEventListener(
                          'mousemove',
                          (e: any) => setTooltipPos([e.clientY, e.clientX])
                        );

                        axios
                          .get(`${urls.api}/anime/info/${slug}`, {
                            signal: requestController.signal,
                          })
                          .then(async (response: AxiosResponse<any>) => {
                            const { data } = response;
                            if (!data || !data.result) return;
                            const { result: details } = data;

                            // setShowTooltip(true);
                            setTooltipContent(
                              <div className={styles.text}>
                                <span
                                  className={styles.title}
                                  title={details.name[0]}
                                >
                                  {details.name[0]}
                                </span>
                                <span className={styles.episode}>
                                  {episode} / {details.episodes}
                                </span>
                                <span className={styles.status}>
                                  {details.status === 'completed'
                                    ? 'Finished Airing'
                                    : 'Airing'}
                                </span>
                                <span className={styles.released}>
                                  {details.released}
                                </span>

                                <span className={styles.genres}>
                                  {details.genres.map(
                                    (genre: string[], i: number) => (
                                      <span key={i}>
                                        <Link
                                          to={generatePath('/genre/:genre', {
                                            genre: genre[1],
                                          })}
                                          title={genre[0]}
                                        >
                                          {genre[0]}
                                        </Link>
                                        {details.genres.length - 1 > i && ', '}
                                      </span>
                                    )
                                  )}
                                </span>
                                <span className={styles.summary}>
                                  {details.summary}
                                </span>
                              </div>
                            );
                          });
                      }}
                      onMouseLeave={(e) => {
                        console.debug(
                          '[hover:off]',
                          `${slug}-episode-${episode}`
                        );
                        requestController.abort();
                        setShowTooltip(false);
                        tooltipMoveEvent = e.target.removeEventListener(
                          'mousemove',
                          null
                        );
                      }}
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
                          <span className={styles.episode}>
                            Episode {episode}
                          </span>
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

          <div>
            <div className={styles.top}>
              <div className={styles.header}>
                <h1>
                  Top Anime
                  <div className={styles.radioDate}>
                    <form
                      onInput={(e: any) => {
                        const target: HTMLInputElement = e.target;
                        setTopTime(target.value);
                      }}
                    >
                      <label htmlFor={'d-date'} data-active={topTime === 'day'}>
                        <input
                          type={'radio'}
                          id={'d-date'}
                          name={'date'}
                          value={'day'}
                          defaultChecked={true}
                        />
                        <span>Today</span>
                      </label>

                      <label
                        htmlFor={'d-week'}
                        data-active={topTime === 'week'}
                      >
                        <input
                          type={'radio'}
                          id={'d-week'}
                          name={'date'}
                          value={'week'}
                        />
                        <span>Week</span>
                      </label>

                      <label
                        htmlFor={'d-month'}
                        data-active={topTime === 'month'}
                      >
                        <input
                          type={'radio'}
                          id={'d-month'}
                          name={'date'}
                          value={'month'}
                        />
                        <span>Month</span>
                      </label>
                    </form>
                  </div>
                </h1>
              </div>

              <div className={styles.topContent}>
                {topData.map((node: GogoTrendingNode, i) => {
                  const { name, slug, image, type } = node;

                  return (
                    <Link
                      className={styles.hrefNode}
                      to={`/watch/${slug}/episode-1`}
                      key={i}
                    >
                      <div className={styles.topNode} title={`Watch ${name}`}>
                        <div className={styles.image}>
                          <img
                            src={image}
                            alt={name}
                            loading={recentPage > 1 ? 'lazy' : 'eager'}
                          />
                          <div className={styles.type} data-type={type}>
                            <span>{type.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className={styles.text}>
                          <span className={styles.title} title={name}>
                            {name}
                          </span>
                          <span className={styles.ranking}>&#35;{i + 1}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  else return <Loading />;
}

export default App;
