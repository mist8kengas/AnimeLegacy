import { useEffect, useMemo, useState } from 'react';
import { generatePath, Link, useNavigate } from 'react-router-dom';

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

export default function Random() {
  const navigate = useNavigate();

  useEffect(() => {
    const randomPage = ~~(Math.random() * 25);
    axios
      .get(`${urls.api}/anime/recent?page=${randomPage}`)
      .then((response: AxiosResponse<GogoRecent>) => {
        const { data } = response;
        if (!data) return;

        const randomItem = data.result[~~(Math.random() * data.result.length)];
        const [, slug] = /(.*)(?:-episode-[0-9])/.exec(randomItem.slug) || [];

        navigate(
          generatePath('/watch/:slug/:episode', {
            slug: slug,
            episode: `episode-1`,
          }),
          { replace: true }
        );
      });
  }, []);

  return <Loading />;
}
