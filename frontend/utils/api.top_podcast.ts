export const getTopPodcasts = async () => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/top_podcasts/');
    if (!res.ok) {
      throw new Error('Failed to fetch top podcasts');
    }
    const data = await res.json();
    return data; 
  } catch (err) {
    console.error("Error fetching top episodes:", err);
    throw err;
  }
};