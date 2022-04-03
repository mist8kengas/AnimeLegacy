import { useEffect, useState } from 'react';
import styles from './SimpleSchedule.module.scss';

import Loading from '../components/Loading';

import axios, { AxiosResponse } from 'axios';

interface AniChartNode {
  id: number;
  episode: number;
  airingAt: number;
  media: {
    id: number;
    idMal: number | null;
    title: {
      native: string | null;
      english: string | null;
      romaji: string | null;
    };
    startDate: {
      year: number;
      month: number;
      day: number;
    };
    endDate: {
      year: number;
      month: number;
      day: number;
    };
    status: 'NOT_YET_RELEASED' | 'RELEASING' | 'FINISHED_RELEASING';
    synonyms: string[];
    averageScore: number;
    bannerImage: string;
    isAdult: boolean;
    coverImage: {
      extraLarge: string;
      color: string;
    };
  };
}
interface AniChartGraphQL {
  data: {
    Page: {
      pageInfo: {
        hasNextPage: boolean;
        total: number;
      };
      airingSchedules: AniChartNode[];
    };
  };
}

function CountdownContent(node: AniChartNode, key: any) {
  const { title, coverImage } = node.media;
  const { episode, airingAt } = node;
  const name = title.romaji || '';
  const image = coverImage.extraLarge;
  const airs_in = airingAt * 1e3;

  function msToTime(ms: number) {
    const seconds = +(ms / 1000).toFixed(1),
      minutes = +(ms / (1000 * 60)).toFixed(1),
      hours = +(ms / (1000 * 60 * 60)).toFixed(1),
      days = +(ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return ~~seconds + ' Seconds';
    else if (minutes < 60) return ~~minutes + ' Minutes';
    else if (hours < 24) return ~~hours + ' Hours';
    else return days + ' Days';
  }

  const airDelay = 108e5; // gogoanime delay (120960)
  const hoursIn = msToTime(airs_in + airDelay - Date.now());
  const willAir = airs_in + airDelay > Date.now(); // 216e5

  const data = (
    <div
      className={styles.scheduleNode}
      title={`${name} Episode ${episode}`}
      key={key}
    >
      <div className={styles.image}>
        <img src={image} alt={name} />
      </div>
      <div className={styles.text}>
        <span className={styles.title} title={name}>
          {name}
        </span>

        <span>Episode {episode}</span>

        <span className={styles.countdown}>
          {willAir ? `Airs in ~${hoursIn}` : 'Aired'}
        </span>
      </div>
    </div>
  );
  return data;
}

export default function SimpleSchedule() {
  const [ready, setReady] = useState(false);
  const [result, setData] = useState<AniChartNode[]>();

  const [render, setRender] = useState(0);

  // regular request
  useEffect(() => {
    const graphqlQuery = `
    query ($weekStart: Int, $weekEnd: Int, $page: Int,) {
      Page(page: $page) {
        pageInfo { hasNextPage total }
        airingSchedules(airingAt_greater: $weekStart, airingAt_lesser: $weekEnd, sort: TIME) {
          episode
          airingAt
          media {
            title { romaji native english }
            coverImage { extraLarge color }
          }
        }
      }
    }
    `;
    axios
      .post('https://graphql.anilist.co/', {
        query: graphqlQuery,
        variables: {
          page: 1,
          weekStart: ~~(Date.now() / 1e3),
          weekEnd: ~~(Date.now() / 1e3) + 604800,
        },
      })
      .then((response: AxiosResponse<AniChartGraphQL>) => {
        const { data } = response.data;
        if (!data) return;

        setData(data.Page.airingSchedules || []);
        setReady(true);
        setRender(Math.random());
      });
  }, []);

  if (ready && render)
    return (
      <div className={styles.content}>
        {/* result */}
        <div>
          <div className={styles.header}>
            <h1>Schedule</h1>
          </div>

          <div className={styles.scheduleContent}>
            {(result || []).map((node, i) => CountdownContent(node, i))}
          </div>
        </div>
      </div>
    );
  else return <Loading />;
}
