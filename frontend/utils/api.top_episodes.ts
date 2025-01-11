// * utils/api.top_episodes.ts


// * Get Top Episodes Data
export const getTopEpisodes = async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/top_episodes');
    if (!res.ok) {
      throw new Error('Failed to fetch top episodes');
    }
    const data = await res.json();
    return data; 
  } catch (err) {
    console.error("Error fetching top episodes:", err);
    throw err;
  }
};