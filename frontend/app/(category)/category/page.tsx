"use client";
import React, { useEffect, useState } from "react";
import {
  getCombinedEpisodeData,
  calculateCategoryCount,
} from "@/utils/api.category";
import StackedLineChart from "@/components/chart/StackedLineChart";

interface CombinedEpisodeData {
  top_episode_id: string;
  rank: number;
  chart_rank_move: "UP" | "DOWN" | "NEW";
  date: string;
  region_id: string;
  episode_uri: string;
  episode_name: string;
  episode_description: string;
  duration_ms: string;
  main_category: string;
  episode_release_date: string;
  podcast_uri: string;
}

const Page = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [episodes, setEpisodes] = useState<CombinedEpisodeData[]>([]); // Menyimpan data episode
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); // Menyimpan error jika ada

  // Chart useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data episode yang digabungkan
        const episodes = await getCombinedEpisodeData();

        // Hitung jumlah kategori berdasarkan tanggal
        const categoryCount = calculateCategoryCount(episodes);

        // Persiapkan data untuk chart
        const xAxisData = Object.keys(categoryCount); // Tanggal-tanggal sebagai data X
        const seriesData = Object.keys(categoryCount[xAxisData[0]]).map(
          (category) => ({
            name: category,
            data: xAxisData.map((date) => categoryCount[date][category] || 0),
          })
        );

        // Update data untuk chart
        setChartData({ xAxisData, seriesData });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Fungsi untuk mengambil data episode
    const fetchEpisodes = async () => {
      try {
        const data = await getCombinedEpisodeData(); // Ambil data episode
        setEpisodes(data); // Simpan data dalam state
      } catch (err) {
        setError("Failed to fetch episode data"); // Menangani error
        console.error("Error fetching episodes:", err);
      } finally {
        setLoading(false); // Setelah selesai, ubah loading menjadi false
      }
    };

    fetchEpisodes(); // Panggil fungsi untuk ambil data
  }, []); // Hanya dijalankan sekali saat pertama kali komponen dirender

  // Jika data sedang dimuat
  if (loading) return <div>Loading...</div>;

  // Jika terjadi error
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Top Episodes</h1>
      <div>
        <h1>Top Episodes Chart</h1>
        {chartData ? (
          <StackedLineChart
            title="Episode Categories by Date"
            xAxisData={chartData.xAxisData}
            seriesData={chartData.seriesData}
          />
        ) : (
          <p>Loading chart data...</p>
        )}
      </div>
    </div>
  );
};

// // Fungsi formatDuration untuk mengubah waktu dari milidetik ke format mm:ss
// const formatDuration = (ms: string) => {
//   const minutes = Math.floor(parseInt(ms) / 60000);
//   const seconds = Math.floor((parseInt(ms) % 60000) / 1000);
//   return `${minutes}:${seconds.toString().padStart(2, "0")}`;
// };

// // Fungsi formatDate untuk mengubah format tanggal
// const formatDate = (dateStr: string) => {
//   const date = new Date(dateStr);
//   return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
// };

export default Page;


// {/* <ul>
// {episodes.map((episode, index) => (
//   <li key={index}>
//     <h2>{episode.episode_name}</h2>
//     <p>{episode.episode_description}</p>
//     <p>
//       <strong>Rank:</strong> {episode.rank}
//     </p>
//     <p>
//       <strong>Chart Move:</strong> {episode.chart_rank_move}
//     </p>
//     <p>
//       <strong>Duration:</strong> {formatDuration(episode.duration_ms)}
//     </p>
//     <p>
//       <strong>Release Date:</strong>{" "}
//       {formatDate(episode.episode_release_date)}
//     </p>
//     <p>
//       <strong>Category:</strong> {episode.main_category}
//     </p>
//     <p>
//       <strong>Podcast URI:</strong>{" "}
//       <a
//         href={episode.podcast_uri}
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         Listen
//       </a>
//     </p>
//     {/* Tampilkan lebih banyak informasi jika perlu */}
//   </li>
// ))}
// </ul> */}