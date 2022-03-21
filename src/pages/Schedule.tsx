import { useEffect, useMemo, useState } from 'react';
import styles from './Schedule.module.scss';

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

interface GogoScheduleNode {
  name: string;
  slug: string;
  episode: number;
  aired: boolean;
  airs_in: number;
  image: string;
}
interface GogoSchedule extends GogoResponse {
  result: {
    sunday: GogoScheduleNode[];
    monday: GogoScheduleNode[];
    tuesday: GogoScheduleNode[];
    wednesday: GogoScheduleNode[];
    thursday: GogoScheduleNode[];
    friday: GogoScheduleNode[];
    saturday: GogoScheduleNode[];
  };
}

function CountdownContent(
  // epoch: number,
  node: GogoScheduleNode,
  i: number
) {
  const { name, slug, episode, airs_in, image } = node;

  if (!slug) {
    console.warn('[Schedule.tsx]', 'ID for', slug, 'is undefined');
    return;
  }

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

  const airDelay = 0; // gogoanime delay (120960)
  const hoursIn = msToTime(Date.now() - (airs_in + airDelay) * 1e3);
  const willAir = (airs_in + airDelay) * 1e3 < Date.now(); // 216e5

  const data = (
    <div className={styles.scheduleNode} title={`Watch ${name} Episode 1`}>
      <div className={styles.image}>
        <img src={image} alt={name} />
        <div
          className={styles.type}
          data-type={slug.split('-').indexOf('dub') > 0 ? 'dub' : 'sub'}
        >
          <span>{slug.split('-').indexOf('dub') > 0 ? 'DUB' : 'SUB'}</span>
        </div>
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

export default function Schedule() {
  const [ready, setReady] = useState(false);
  const [result, setData] = useState<{ [index: string]: any[] }>({
    sunday: new Array(),
    monday: new Array(),
    tuesday: new Array(),
    wednesday: new Array(),
    thursday: new Array(),
    friday: new Array(),
    saturday: new Array(),
  });

  const [render, setRender] = useState(0);

  // regular request
  useEffect(() => {
    axios
      .get(`${urls.api}/anime/schedule`)
      .then((response: AxiosResponse<GogoSchedule>) => {
        const { data } = response;
        if (!data) return;

        setData(data.result);

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

          <div className={styles.scheduleContainer}>
            {Object.keys(result).map((day) => {
              return (
                <div className={styles.scheduleData}>
                  <h1>{day[0].toUpperCase() + day.substring(1)}</h1>
                  <div className={styles.scheduleContent}>
                    {result[day].map((node: GogoScheduleNode, i) =>
                      CountdownContent(node, i)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  else return <Loading />;
}
