"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

// Mengimpor fungsi getTopEpisodes dan getEpisodeByUri
import { getTopEpisodes } from "@/utils/api.top_episodes";
import { getEpisodeByUri } from "@/utils/api.episode";

interface TopEpisodeData {
  top_episode_id: string;
  rank: number;
  chart_rank_move: string;
  date: string;
  region_id: string;
  episode_uri: string;
  episode_name: string; // Pastikan ada properti 'episode_name'
}

interface EpisodeDetails {
  episode_uri: string;
  episode_name: string;
  episode_description: string;
  duration_ms: string;
  main_category: string;
  episode_release_date: string;
  podcast_uri: string;
  region_id: string;
}

const TrendingEpisode: React.FC = () => {
  // State untuk menyimpan data yang diambil
  const [data, setData] = useState<TopEpisodeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk menyimpan detail episode yang dipilih
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails[]>([]);

  // Mengambil data top episodes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const topEpisodesResponse = await getTopEpisodes();

        // Pastikan response berisi top_episodes dan itu array
        if (Array.isArray(topEpisodesResponse.top_episodes)) {
          // Mengurutkan data berdasarkan tanggal terbaru
          const sortedData = topEpisodesResponse.top_episodes.sort(
            (a: TopEpisodeData, b: TopEpisodeData) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateB.getTime() - dateA.getTime(); // Urutkan berdasarkan tanggal terbaru
            }
          );

          const topEpisodes = sortedData.slice(0, 5);
          setData(topEpisodes);

          const episodeUris = topEpisodes.map(
            (episode: TopEpisodeData) => episode.episode_uri
          );
          const episodeDetailsPromises = episodeUris.map(
            async (uri: string) => {
              const episodeData = await getEpisodeByUri(uri); // Mengambil detail episode berdasarkan URI
              return episodeData; // Menyimpan hasil dari getEpisodeByUri
            }
          );

          // Tunggu semua request detail episode selesai
          const episodeDetailsResponse = await Promise.all(
            episodeDetailsPromises
          );

          // Perbarui state dengan detail episode untuk setiap episode
          setEpisodeDetails(episodeDetailsResponse);
        } else {
          throw new Error("API response does not contain top_episodes array");
        }
      } catch (err) {
        setError(`Failed to fetch data: ${err}`);
      } finally {
        setLoading(false); // Set loading ke false setelah selesai mengambil data
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <ul className="w-full flex flex-col space-y-4">
        <li className="w-full flex justify-start items-start rounded-md">
          <p className="w-14">Rank</p>
          <p className="w-full">Episode Name</p>
        </li>
        {data.map((item, index) => (
          <li
            key={index}
            className="w-full flex justify-start items-start rounded-md"
          >
            <p className="w-14">{item.rank}.</p>
            <Link
              href={`/episode/${episodeDetails[index]?.episode_uri}`}
              className="text-blue-400 hover:text-blue-600 cursor-pointer"
            >
              {episodeDetails[index]?.episode_name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingEpisode;
