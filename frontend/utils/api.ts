interface SpotifyData {
  id: number;
  songName: string;
  artist: string;
  album: string;
}

// utils/api.ts
export const fetchSpotifyData = async (): Promise<SpotifyData[]> => {
  const res = await fetch('http://your-backend-api.com/api/spotify-data');
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  const data: SpotifyData[] = await res.json();
  return data;
};
