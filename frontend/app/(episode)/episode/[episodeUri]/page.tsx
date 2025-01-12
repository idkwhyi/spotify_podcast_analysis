// app/episode/[episodeUri]/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react";
import { fetchEpisodeDetails, type EpisodeDetails, formatDuration } from '@/utils/api.episode';

export default function EpisodePage() {
  const params = useParams();
  const episodeUri = params.episodeUri as string;
  const [episode, setEpisode] = useState<EpisodeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEpisode = async () => {
      try {
        const details = await fetchEpisodeDetails(episodeUri);
        setEpisode(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load episode details');
      } finally {
        setIsLoading(false);
      }
    };

    loadEpisode();
  }, [episodeUri]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner color="white" size="lg" />
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="text-red-500 p-4">
        {error || 'Episode not found'}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-background border-borderColor">
        <CardHeader className="border-b border-borderColor">
          <h1 className="text-2xl font-bold">{episode.episode_name}</h1>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-300">{episode.episode_description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Details</h2>
                <ul className="space-y-2">
                  <li><span className="font-medium">Duration:</span> {formatDuration(episode.duration_ms)}</li>
                  <li><span className="font-medium">Category:</span> {episode.main_category}</li>
                  <li><span className="font-medium">Release Date:</span> {new Date(episode.episode_release_date).toLocaleDateString()}</li>
                  <li><span className="font-medium">Region:</span> {episode.region_id}</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-2">Links</h2>
                <ul className="space-y-2">
                  <li>
                    <a
                      href={`https://open.spotify.com/episode/${episode.episode_uri}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-600"
                    >
                      Listen on Spotify
                    </a>
                  </li>
                  <li>
                    <a
                      href={`https://open.spotify.com/show/${episode.podcast_uri}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-600"
                    >
                      View Podcast
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}