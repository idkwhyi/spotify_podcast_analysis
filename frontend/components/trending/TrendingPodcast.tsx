"use client";
import React, { useEffect, useState } from "react";

// Mengimpor fungsi getTopEpisodes dan getEpisodeByUri
import { getTopPodcasts } from "@/utils/api.top_podcast";
import { getPodcastByUri } from "@/utils/api.podcast";

interface TopPodcastData {
  top_podcast_id: string;
  rank: number;
  chart_rank_move: string;
  date: string;
  region_id: string;
  podcast_uri: string;
  podcast_name: string; // Pastikan ada properti 'episode_name'
}

interface PodcastDetails {
  podcast_uri: string;
  podcast_name: string;
  podcasat_description: string;
  region_id: string;
}

const TrendingPodcast: React.FC = () => {
  // State untuk menyimpan data yang diambil
  const [data, setData] = useState<TopPodcastData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk menyimpan detail episode yang dipilih
  const [podcastDetails, setPodcastDetails] = useState<PodcastDetails[]>([]);

  // Mengambil data top episodes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const topPodcastsResponse = await getTopPodcasts();

        // Pastikan response berisi top_episodes dan itu array
        if (Array.isArray(topPodcastsResponse.top_podcast)) {
          // Mengurutkan data berdasarkan tanggal terbaru
          const sortedData = topPodcastsResponse.top_podcast.sort(
            (a: TopPodcastData, b: TopPodcastData) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateB.getTime() - dateA.getTime(); // Urutkan berdasarkan tanggal terbaru
            }
          );

          const topPodcasts = sortedData.slice(0, 5);
          setData(topPodcasts); 

          const podcastUris = topPodcasts.map(
            (podcast: TopPodcastData) => podcast.podcast_uri
          );
          const podcastDetailsPromises = podcastUris.map(
            async (uri: string) => {
              const podcastData = await getPodcastByUri(uri); // Mengambil detail episode berdasarkan URI
              return podcastData; // Menyimpan hasil dari getEpisodeByUri
            }
          );

          // Tunggu semua request detail episode selesai
          const podcastDetailsResponse = await Promise.all(
            podcastDetailsPromises
          );

          // Perbarui state dengan detail episode untuk setiap episode
          setPodcastDetails(podcastDetailsResponse);
        } else {
          throw new Error("API response does not contain top_podcasts array");
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
        <li
          className="w-full flex justify-start items-start rounded-md"
        >
          <p className="w-14">Rank</p>
          <p className="w-full">Name</p>
        </li>
        {data.map((item, index) => (
          <li
            key={index}
             className="w-full flex justify-start items-start rounded-md"
          >
            <p className="w-14">{item.rank}.</p>
            <p className="w-full">{podcastDetails[index]?.podcast_name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingPodcast;
