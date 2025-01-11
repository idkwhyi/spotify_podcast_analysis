

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
