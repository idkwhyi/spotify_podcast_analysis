interface SpotifyData {
  id: number;
  songName: string;
  artist: string;
  album: string;
}

// Get Top Episodes Data

export const fetchTopEpisodes = async (): Promise<SpotifyData[]> => {
  const res = await fetch("http://127.0.0.1:5000/api/top_episodes", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to get top episodes")
  }
  
  const data: SpotifyData[] = await res.json()
  return data
};

export const fetchSpotifyData = async (): Promise<SpotifyData[]> => {
  const res = await fetch("http://your-backend-api.com/api/spotify-data", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  const data: SpotifyData[] = await res.json();
  return data;
};
