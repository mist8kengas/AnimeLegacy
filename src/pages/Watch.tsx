import { useEffect, useMemo, useState } from 'react';
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

  // trending section
  const [trendingData, setTrendingData] = useState(new Array());
  useMemo(() => {
    return void axios
      .get(`${urls.api}/anime/top/month`)
      .then((response: AxiosResponse<GogoRecent>) => {
        const { data } = response;
        if (!data) return;
        setTrendingData(data.result);
      });
  }, []);

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
        <div className={styles.mainContent}>
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
                        title={`Watch ${details.result.name[0]} Episode ${
                          i + 1
                        }`}
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

        <div className={styles.sideContent}>
          <div className={styles.header}>
            <h1>Trending</h1>
          </div>

          <div className={styles.trendingContent}>
            {trendingData.map((node: GogoTrendingNode, i) => {
              const { name, slug, image, type } = node;

              return (
                <Link
                  className={styles.hrefNode}
                  to={`/watch/${slug}/episode-1`}
                  key={i}
                  reloadDocument={true}
                >
                  <div className={styles.trendingNode} title={`Watch ${name}`}>
                    <div className={styles.image}>
                      <img src={image} alt={name} />
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

        <script type='text/javascript' data-cfasync='false'>
          {`/*<![CDATA[/* */
        (function(){var b81122d773e1ac3409b9c4ed1661ce4b="EcOAaJM4B_YjYZZoa_URJk79IIndg-M-M1imjLIosRKom8NQfT4FPFixioqS38KvxOgrQFJrbqc1e_N1rg";var a=['GsOSe8OkwrpeZU9X','w4bCqsO/w7U4wrQRwoTDl8KCw6zCp8ODw4LDn8O2w5cuS3fDksOFMcOIAsOMwqAbwp3DuRPDmsK5ZSrDuMOZwqRUQQ7CgFvDlQ==','w6MhTsKL','wrHCkRtHw5TDlMOrcA==','F8KrBsKZwq0Gw40AZsOfD8Oq','woMFwrBcfQQ=','w5RBEEfChGo=','RBDDlsOVwpIWwpHDo8Ozwptew5TCug==','wrvDiMKFw6V1Xg5m','wp1Vw6g7w47Dvw==','aVN5w7DDlAM/w5zClMO1XsKFbcKdYcKKwqrCv8O8dw==','wrbCjBdBw4rDvsO3bV/Dj30=','w50iWMKVRw==','wrLClnRMGMKmJw==','worCrybCtg==','fcO/YsKEwrd0worChMK6w4xwwqY=','w5DCr8OEwqHCicOfVQ==','D8Kpw68hwrXCii/CiQ==','w5nDnsO8w5kEwqfDlglewqNSw40=','wp/Ci8KAw7B6eMOvwqvCjBdpw5tfw7Ze','Zgd0w7U6wpd4XMKww6I=','LHHCt8OXw7ITO8Kdwr/Dj8OGUBTCrQ==','w5fCq8KFw7/Cq1Y=','fiYkHnhcwqpcwr5SEj/DtcOYIyF/F8Kvw4PCrQbDvMO2XsKHYWs+BMKXwp/CuSNsw7nCo8OM','w5PDgsOqw50CwrbDkQBdwqFFw4Y4','wrAhdA=='];(function(b,d){var f=function(g){while(--g){b['push'](b['shift']());}};f(++d);}(a,0xe3));var b=function(c,d){c=c-0x0;var e=a[c];if(b['spFdrG']===undefined){(function(){var h=function(){var k;try{k=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(l){k=window;}return k;};var i=h();var j='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';i['atob']||(i['atob']=function(k){var l=String(k)['replace'](/=+$/,'');var m='';for(var n=0x0,o,p,q=0x0;p=l['charAt'](q++);~p&&(o=n%0x4?o*0x40+p:p,n++%0x4)?m+=String['fromCharCode'](0xff&o>>(-0x2*n&0x6)):0x0){p=j['indexOf'](p);}return m;});}());var g=function(h,l){var m=[],n=0x0,o,p='',q='';h=atob(h);for(var t=0x0,u=h['length'];t<u;t++){q+='%'+('00'+h['charCodeAt'](t)['toString'](0x10))['slice'](-0x2);}h=decodeURIComponent(q);var r;for(r=0x0;r<0x100;r++){m[r]=r;}for(r=0x0;r<0x100;r++){n=(n+m[r]+l['charCodeAt'](r%l['length']))%0x100;o=m[r];m[r]=m[n];m[n]=o;}r=0x0;n=0x0;for(var v=0x0;v<h['length'];v++){r=(r+0x1)%0x100;n=(n+m[r])%0x100;o=m[r];m[r]=m[n];m[n]=o;p+=String['fromCharCode'](h['charCodeAt'](v)^m[(m[r]+m[n])%0x100]);}return p;};b['JTrglS']=g;b['CvJToj']={};b['spFdrG']=!![];}var f=b['CvJToj'][c];if(f===undefined){if(b['lUycBQ']===undefined){b['lUycBQ']=!![];}e=b['JTrglS'](e,d);b['CvJToj'][c]=e;}else{e=f;}return e;};var o=window;o[b('0x9','GY@D')]=[[b('0x3','NTZh'),0x49213f],[b('0xd','2P#E'),0x0],[b('0x2','OpVt'),'0'],[b('0x16','yStr'),0x0],[b('0x17','Gmre'),![]],[b('0xe','NizR'),0x0],[b('0xb','m(yb'),!0x0]];var p=[b('0x4','gaUv'),b('0x8','oh7m')],v=0x0,z,d=function(){if(!p[v])return;z=o[b('0xf','0*ti')][b('0x5','1cFO')](b('0x10','[*YF'));z[b('0x15','60F&')]=b('0x0','%tOm');z[b('0x13','GY@D')]=!0x0;var c=o[b('0xa','*Y0&')][b('0x11','xyrG')](b('0xc','4tKk'))[0x0];z[b('0x6','luO#')]=b('0x18','beGm')+p[v];z[b('0x12','*Y0&')]=b('0x7','J![c');z[b('0x14','MnUQ')]=function(){v++;d();};c[b('0x1','Kw5O')][b('0x19','1cFO')](z,c);};d();})();
        /*]]>/* */`}
        </script>
      </div>
    );
  } else return <Loading />;
}
