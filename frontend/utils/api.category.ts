import { getTopEpisodes } from "./api.top_episodes";
import { fetchEpisodeDetails } from "./api.episode";

export interface CombinedEpisodeData {
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


// Fungsi utama untuk mendapatkan data episode top dan detailnya
export const getCombinedEpisodeData = async (): Promise<CombinedEpisodeData[]> => {
  try {
    // Ambil data top episodes
    const topEpisodesData = await getTopEpisodes();
    const allEpisodes = topEpisodesData.top_episodes;

    // Ambil detail episode secara paralel menggunakan Promise.all
    const combinedData = await Promise.all(
      allEpisodes.map(async (episode: { episode_uri: string; }) => {
        try {
          // Ambil detail episode berdasarkan episode_uri
          const episodeDetail = await fetchEpisodeDetails(episode.episode_uri);

          // Jika episodeDetail ditemukan, gabungkan data top episode dan detail episode
          if (episodeDetail) {
            return {
              ...episode, // Menggabungkan data top episode
              ...episodeDetail // Menggabungkan data detail episode
            };
          }

          // Jika episodeDetail tidak ditemukan, kembalikan null atau data default
          return null;
        } catch (err) {
          console.error(`Error fetching details for episode ${episode.episode_uri}:`, err);
          return null; // Return null jika terjadi error pada episode ini
        }
      })
    );

    // Filter hanya episode yang berhasil (yang bukan null)
    return combinedData.filter((data): data is CombinedEpisodeData => data !== null);
  } catch (error) {
    console.error('Error fetching combined episode data:', error);
    throw error; // Pastikan error dilempar agar bisa ditangani di tempat lain
  }
};


// Fungsi untuk menghitung kategori per tanggal
export const calculateCategoryCount = (episodes: CombinedEpisodeData[]) => {
  const categoryCount: Record<string, Record<string, number>> = {};

  episodes.forEach(episode => {
    const { date, main_category } = episode;

    if (!categoryCount[date]) {
      categoryCount[date] = {}; // Inisialisasi tanggal jika belum ada
    }

    if (!categoryCount[date][main_category]) {
      categoryCount[date][main_category] = 0; // Inisialisasi kategori jika belum ada
    }

    // Increment jumlah kategori pada tanggal tertentu
    categoryCount[date][main_category] += 1;
  });

  return categoryCount;
};