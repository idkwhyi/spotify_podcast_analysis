"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@nextui-org/react";

interface PodcastDetails {
  podcast_uri: string;
  podcast_name: string;
  podcast_description: string;
  region_id: string;
}

interface PodcastEpisode {
  episode_uri: string;
  episode_name: string;
  episode_description: string;
  episode_release_date: string;
  duration_ms: number;
}

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <Spinner size="lg" color="primary" />
    <p className="text-gray-400">Loading podcast details...</p>
  </div>
);

const PodcastDetail = () => {
  const params = useParams();
  const podcastUri = params.podcastUri as string;

  const [details, setDetails] = useState<PodcastDetails | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcastDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch podcast details
        const detailsResponse = await fetch(
          `http://127.0.0.1:5000/api/podcast/${podcastUri}`
        );
        if (!detailsResponse.ok) {
          throw new Error("Failed to fetch podcast details");
        }
        const detailsData = await detailsResponse.json();
        setDetails(detailsData.podcast);

        // Fetch podcast episodes
        const episodesResponse = await fetch(
          `http://127.0.0.1:5000/api/episode/podcast/${podcastUri}`
        );
        if (!episodesResponse.ok) {
          throw new Error("Failed to fetch podcast episodes");
        }
        const episodesData = await episodesResponse.json();
        const sortedEpisodes = episodesData.episodes || [];

        // Sort episodes by release date in descending order
        sortedEpisodes.sort((a: PodcastEpisode, b: PodcastEpisode) => {
          const dateA = new Date(a.episode_release_date).getTime();
          const dateB = new Date(b.episode_release_date).getTime();
          return dateB - dateA; // For descending order (newest first)
        });

        setEpisodes(sortedEpisodes);

        console.log("EPS DATA", episodesData);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (podcastUri) {
      fetchPodcastDetails();
    }
  }, [podcastUri]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 space-y-2">
        <div>{error}</div>
        <Link href="/podcast" className="text-blue-500 hover:text-blue-700">
          ← Back to Podcasts
        </Link>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-red-500 p-4">
        Podcast not found
        <Link
          href="/podcast"
          className="text-blue-500 hover:text-blue-700 ml-4"
        >
          ← Back to Podcasts
        </Link>
      </div>
    );
  }

  const tableColumnStyle = 'text-left z-20 p-2 bg-obsidianShadow border-y border-y-borderColor';
  const tableRowStyle = 'border-b border-b-borderColor'


  return (
    <div className="space-y-6 p-4">
      {/* Navigation */}
      <Link
        href="/podcast"
        className="text-blue-500 hover:text-blue-700 mb-4 inline-block"
      >
        ← Back to Podcasts
      </Link>

      {/* Podcast Info Card */}
      <Card className="bg-background border-borderColor">
        <CardHeader className="flex flex-col items-start">
          <h1 className="text-2xl font-bold">{details.podcast_name}</h1>
          <p className="text-gray-400">Region: {details.region_id}</p>
        </CardHeader>
        <CardBody>
          <p className="text-gray-300">{details.podcast_description}</p>
          <a
            href={`https://open.spotify.com/show/${details.podcast_uri}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 mt-4 inline-block"
          >
            Listen on Spotify →
          </a>
        </CardBody>
      </Card>

      {/* Episodes Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Episodes</h2>
        <Table
          aria-label="Podcast episodes"
          classNames={{
            base: "max-h-[600px] overflow-scroll bg-background",
            table: "min-h-[400px]",
            thead: "bg-obsidianShadow",
            tr: "hover:bg-lime-900/50",
          }}
          className="border border-borderColor rounded-xl"
        >
          <TableHeader>
            <TableColumn className={tableColumnStyle}>Episode Name</TableColumn>
            <TableColumn className={tableColumnStyle}>Release Date</TableColumn>
            <TableColumn className={tableColumnStyle}>Duration</TableColumn>
            <TableColumn className={tableColumnStyle}>Listen</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No episodes available.">
            {episodes.map((episode) => (
              <TableRow className={tableRowStyle} key={episode.episode_uri}>
                <TableCell>
                  <div>
                    <div className="font-medium">{episode.episode_name}</div>
                    <div className="text-sm text-gray-400 truncate">
                      {episode.episode_description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(episode.episode_release_date)}
                </TableCell>
                <TableCell>{formatDuration(episode.duration_ms)}</TableCell>
                <TableCell>
                  <a
                    href={`https://open.spotify.com/episode/${episode.episode_uri}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Listen
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PodcastDetail;
