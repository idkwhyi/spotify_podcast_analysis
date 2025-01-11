// pages/trending-episode.tsx
"use client";
import React from "react";
import { GetStaticProps } from "next";
import { fetchSpotifyData } from "@/utils/api";

interface SpotifyData {
  id: number;
  songName: string;
  artist: string;
  album: string;
}

interface Props {
  data: SpotifyData[];
}

const TrendingEpisode: React.FC<Props> = ({ data }) => {
  return (
    <div>
      <h1>Spotify Data</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            {item.songName} by {item.artist} (Album: {item.album})
          </li>
        ))}
      </ul>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const data = await fetchSpotifyData(); // Use the utility function here

  return {
    props: { data },
    revalidate: 60,
  };
};

export default TrendingEpisode;
