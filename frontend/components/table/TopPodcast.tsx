"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@nextui-org/react";
import Link from "next/link";

interface TopPodcast {
  top_podcast_id: string;
  rank: number;
  previous_rank?: number; // Added for historical tracking
  chart_rank_move: "UP" | "DOWN" | "NEW" | "UNCHANGED";
  date: string;
  region_id: string;
  podcast_uri: string;
}

interface PodcastDetails {
  podcast_uri: string;
  podcast_name: string;
  podcast_description: string;
  region_id: string;
}

interface CombinedPodcastData extends Omit<TopPodcast, 'podcast_uri'>, PodcastDetails {}

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <Spinner size="lg" color="primary"/>
    <p className="text-gray-400">Loading top podcasts...</p>
  </div>
);

const fetchTopPodcasts = async (): Promise<CombinedPodcastData[]> => {
  try {
    // Fetch top podcasts
    const topPodcastsResponse = await fetch("http://127.0.0.1:5000/api/top_podcasts/");
    if (!topPodcastsResponse.ok) {
      throw new Error(`Error fetching podcasts: ${topPodcastsResponse.statusText}`);
    }
    const topPodcastsData = await topPodcastsResponse.json();
    
    if (!topPodcastsData.top_podcast || topPodcastsData.top_podcast.length === 0) {
      throw new Error("No podcasts found");
    }

    // Get the latest date from the data
    const dates = topPodcastsData.top_podcast.map((podcast: TopPodcast) => new Date(podcast.date));
    const latestDate = new Date(Math.max(...dates.map(date => date.getTime())));
    
    // Filter podcasts to only show the latest date
    const latestPodcasts = topPodcastsData.top_podcast.filter((podcast: TopPodcast) => 
      new Date(podcast.date).toDateString() === latestDate.toDateString()
    );

    // Get previous day's data for rank comparison
    const previousDay = new Date(latestDate);
    previousDay.setDate(previousDay.getDate() - 1);
    
    // Add previous rank information
    const podcastsWithHistory = latestPodcasts.map((podcast: TopPodcast) => {
      const previousDayData = topPodcastsData.top_podcast.find(
        (p: TopPodcast) => 
          p.podcast_uri === podcast.podcast_uri && 
          new Date(p.date).toDateString() === previousDay.toDateString()
      );
      
      return {
        ...podcast,
        previous_rank: previousDayData?.rank
      };
    });

    // Fetch details for each podcast
    const detailedPodcasts = await Promise.all(
      podcastsWithHistory.map(async (podcast: TopPodcast) => {
        try {
          const detailsResponse = await fetch(
            `http://127.0.0.1:5000/api/podcast/${podcast.podcast_uri}`
          );
          if (!detailsResponse.ok) {
            throw new Error(`Error fetching podcast details: ${detailsResponse.statusText}`);
          }
          const detailsData = await detailsResponse.json();
          
          return {
            ...podcast,
            ...detailsData.podcast,
          };
        } catch (error) {
          console.error(`Error fetching details for podcast ${podcast.podcast_uri}:`, error);
          return {
            ...podcast,
            podcast_name: "Unknown Podcast",
            podcast_description: "Description unavailable",
          };
        }
      })
    );

    return detailedPodcasts;
  } catch (error) {
    console.error("Error in fetchTopPodcasts:", error);
    throw error;
  }
};

const TopPodcast = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [podcasts, setPodcasts] = useState<CombinedPodcastData[]>([]);
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const loadPodcasts = async () => {
      try {
        setIsLoading(true);
        const podcastData = await fetchTopPodcasts();
        setPodcasts(podcastData);
        if (podcastData.length > 0) {
          setCurrentDate(new Date(podcastData[0].date).toLocaleDateString());
        }
      } catch (error) {
        setError(`Failed to load podcasts: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPodcasts();
  }, []);

  const getRankChangeDisplay = (item: CombinedEpisodeData & { previous_rank?: number }) => {
      const rankDiff = item.previous_rank ? item.previous_rank - item.rank : 0;
      
      switch (item.chart_rank_move) {
        case "UP":
          return (
            <div className="flex flex-col">
              <span className="text-green-500">↑ Up</span>
              <span className="text-sm text-green-400">{`+${rankDiff} positions`}</span>
              <span className="text-xs text-gray-400">{`Previous: #${item.previous_rank}`}</span>
            </div>
          );
        case "DOWN":
          return (
            <div className="flex flex-col">
              <span className="text-red-500">↓ Down</span>
              <span className="text-sm text-red-400">{`${rankDiff} positions`}</span>
              <span className="text-xs text-gray-400">{`Previous: #${item.previous_rank}`}</span>
            </div>
          );
        case "NEW":
          return (
            <div className="flex flex-col">
              <span className="text-blue-500">New Entry</span>
              <span className="text-xs text-gray-400">First time in charts</span>
            </div>
          );
        default:
          return item.chart_rank_move;
      }
    };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 space-y-2">
        <div>{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Top Podcasts</h1>
        <div className="text-gray-400">
          Rankings for {currentDate}
        </div>
      </div>
      
      <div className="bg-blue-900/20 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Daily Rankings Information</h2>
        <p className="text-gray-300">
          These rankings are updated daily and show the most popular podcasts for the current date.
          The rank changes indicate movement from the previous day&apos;s position.
        </p>
      </div>

      <Table
        isHeaderSticky
        aria-label="Top Podcast rankings table"
        classNames={{
          base: "max-h-[520px] overflow-scroll bg-background scrollbar-hide",
          table: "min-h-[400px]",
          thead: "bg-obsidianShadow",
          th: "bg-obsidianShadow",
          tr: "hover:bg-lime-900/50",
          td: "bg-transparent",
        }}
        className="border border-borderColor rounded-xl"
      >
        <TableHeader>
          <TableColumn className="text-left p-2 bg-obsidianShadow border-y border-y-borderColor">Rank</TableColumn>
          <TableColumn className="text-left p-2 bg-obsidianShadow border-y border-y-borderColor">Podcast Name</TableColumn>
          <TableColumn className="text-left p-2 bg-obsidianShadow border-y border-y-borderColor">Movement</TableColumn>
          <TableColumn className="text-left p-2 bg-obsidianShadow border-y border-y-borderColor">Region</TableColumn>
          <TableColumn className="text-left p-2 bg-obsidianShadow border-y border-y-borderColor">Listen</TableColumn>
        </TableHeader>
        <TableBody>
          {podcasts.map((podcast) => (
            <TableRow key={`${podcast.top_podcast_id}-${podcast.rank}`} className="border-b border-b-borderColor">
              <TableCell className="p-2">{podcast.rank}</TableCell>
              <TableCell className="p-2">
                <Link
                  href={`/podcast/${podcast.podcast_uri}`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {podcast.podcast_name}
                </Link>
                <p className="text-sm text-gray-400 truncate">{podcast.podcast_description}</p>
              </TableCell>
              <TableCell className="p-2">{getRankChangeDisplay(podcast)}</TableCell>
              <TableCell className="p-2">{podcast.region_id}</TableCell>
              <TableCell className="p-2">
                <a
                  href={`https://open.spotify.com/show/${podcast.podcast_uri}`}
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
  );
};

export default TopPodcast;