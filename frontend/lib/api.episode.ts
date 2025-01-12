
// * this function is same as fetchEpisodeDetails
export const getEpisodeByUri = async (episodeUri: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/episode/${episodeUri}`);
    
    if (!response.ok) {
      throw new Error('Episode not found');
    }

    const data = await response.json();
    return data.episode; 
  } catch (error) {
    console.error('Error fetching episode:', error);
    return null;
  }
};

export interface TopEpisode {
  top_episode_id: string;
  rank: number;
  chart_rank_move: "UP" | "DOWN" | "NEW";
  date: string;
  region_id: string;
  episode_uri: string;
}

export interface EpisodeDetails {
  episode_uri: string;
  episode_name: string;
  episode_description: string;
  duration_ms: string;
  main_category: string;
  episode_release_date: string;
  podcast_uri: string;
  region_id: string;
}

export interface TopEpisodesResponse {
  top_episodes: TopEpisode[];
}

export interface EpisodeResponse {
  episode: EpisodeDetails;
}

export type CombinedEpisodeData = TopEpisode & EpisodeDetails;

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const fetchTopEpisodes = async (): Promise<TopEpisodesResponse> => {
  const response = await fetch(`${API_BASE_URL}/top_episodes/`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// *

export const fetchEpisodeDetails = async (episodeUri: string): Promise<EpisodeDetails | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/episode/${episodeUri}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: EpisodeResponse = await response.json();

    console.log(data.episode)
    return data.episode;
  } catch (error) {
    console.error("Error fetching episode details:", error);
    return null;
  }
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

export const formatDuration = (ms: string) => {
  const minutes = Math.floor(parseInt(ms) / 60000);
  const seconds = Math.floor((parseInt(ms) % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};