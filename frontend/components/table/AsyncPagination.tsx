"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@nextui-org/react";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import Link from "next/link";
import { fetchTopEpisodes, fetchEpisodeDetails, formatDate, type CombinedEpisodeData } from "@/utils/api.episode";

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <Spinner size="lg" color="primary"/>
    <p className="text-gray-400">Loading top episodes...</p>
  </div>
);

const AsyncEpisodeTable = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  const list = useAsyncList<CombinedEpisodeData>({
    async load({ cursor }) {
      try {
        if (!cursor) {
          setIsLoading(true);
        }
        setError(null);

        const json = await fetchTopEpisodes();
        
        // Get the most recent date from the data
        const dates = json.top_episodes.map(episode => new Date(episode.date).getTime());
        const mostRecentDate = dates.length > 0 ? Math.max(...dates) : null;
        
        if (!mostRecentDate) {
          setDebugInfo("No dates found in the data");
          return { items: [], cursor: undefined };
        }

        const mostRecentDateStr = formatDate(new Date(mostRecentDate).toISOString());
        setCurrentDate(new Date(mostRecentDate).toLocaleDateString());
        
        // Filter episodes for the most recent date
        const latestEpisodes = json.top_episodes.filter(episode => {
          const episodeDate = formatDate(episode.date);
          return episodeDate === mostRecentDateStr;
        });

        // Get previous day's data for comparison
        const previousDay = new Date(mostRecentDate);
        previousDay.setDate(previousDay.getDate() - 1);
        const previousDayStr = formatDate(previousDay.toISOString());
        const previousDayEpisodes = json.top_episodes.filter(episode => 
          formatDate(episode.date) === previousDayStr
        );

        // Enhance episodes with previous rank information
        const enhancedEpisodes = latestEpisodes.map(episode => {
          const previousEpisode = previousDayEpisodes.find(prev => 
            prev.episode_uri === episode.episode_uri
          );
          return {
            ...episode,
            previous_rank: previousEpisode?.rank
          };
        });

        const episodeDetailsPromises = enhancedEpisodes.map(episode =>
          fetchEpisodeDetails(episode.episode_uri)
        );
        const episodeDetailsResults = await Promise.all(episodeDetailsPromises);

        const enhancedResults = enhancedEpisodes.map((episode, index) => {
          const details = episodeDetailsResults[index];
          if (!details) return null;

          return {
            ...episode,
            ...details
          };
        }).filter((item): item is CombinedEpisodeData => item !== null);

        setDebugInfo(`Displaying ${enhancedResults.length} episodes for ${mostRecentDateStr}`);
        setHasMore(false);
        setIsLoading(false);

        return {
          items: enhancedResults,
          cursor: undefined
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error("Error loading data:", errorMessage);
        setError(errorMessage);
        setDebugInfo(`Error: ${errorMessage}`);
        setIsLoading(false);
        return {
          items: [],
          cursor: undefined
        };
      }
    },
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: list.loadMore
  });

  const tableColumnStyle = 'text-left z-20 p-2 bg-obsidianShadow border-y border-y-borderColor';

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
            <span className="text-blue-400">New Entry</span>
            <span className="text-xs text-gray-400">First time in charts</span>
          </div>
        );
      default:
        return item.chart_rank_move;
    }
  };

  if (error) {
    return (
      <div className="text-red-500 p-4 space-y-2">
        <div>Error loading episodes: {error}</div>
        <div className="text-sm text-gray-500">{debugInfo}</div>
        <button
          onClick={() => list.reload()}
          className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Top Episodes</h1>
        <div className="text-gray-400">
          Rankings for {currentDate}
        </div>
      </div>
      
      <div className="bg-blue-900/20 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Daily Episode Rankings</h2>
        <p className="text-gray-300">
          These rankings show the most popular episodes for today. Rank changes and positions 
          are compared to the previous day&apos;s rankings.
        </p>
      </div>

      <Table
        isHeaderSticky
        aria-label="Episode rankings table with infinite pagination"
        baseRef={scrollerRef}
        bottomContent={
          hasMore ? (
            <div className="flex w-full justify-center">
              <Spinner ref={loaderRef} color="white" />
            </div>
          ) : null
        }
        classNames={{
          base: "max-h-[520px] overflow-scroll bg-background scrollbar-hide",
          table: "min-h-[400px] bg-background",
          thead: "bg-obsidianShadow",
          th: "bg-obsidianShadow",
          tr: "bg-background hover:bg-lime-900/50",
          td: "bg-transparent",
          wrapper: "bg-background",
        }}
        className="border border-borderColor rounded-xl bg-background"
      >
        <TableHeader>
          <TableColumn key="rank" className={tableColumnStyle}>Rank</TableColumn>
          <TableColumn key="episode_name" className={tableColumnStyle}>Episode Name</TableColumn>
          <TableColumn key="chart_rank_move" className={tableColumnStyle}>Rank Change</TableColumn>
          <TableColumn key="region_id" className={tableColumnStyle}>Region</TableColumn>
          <TableColumn key="episode_uri" className={tableColumnStyle}>Episode Link</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          items={list.items}
          loadingContent={<LoadingScreen />}
          className="bg-background"
        >
          {(item) => (
            <TableRow 
              key={`${item.episode_uri}-${item.rank}`} 
              className="border-b border-b-borderColor"
            >
              <TableCell className="p-2">#{item.rank}</TableCell>
              <TableCell className="p-2">
                <Link
                  href={`/episode/${item.episode_uri}`}
                  className="text-blue-400 hover:text-blue-600 cursor-pointer"
                >
                  {item.episode_name}
                </Link>
                {item.episode_description && (
                  <p className="text-sm text-gray-400 truncate mt-1">
                    {item.episode_description}
                  </p>
                )}
              </TableCell>
              <TableCell className="p-2">{getRankChangeDisplay(item)}</TableCell>
              <TableCell className="p-2">{item.region_id}</TableCell>
              <TableCell className="p-2">
                <a
                  href={`https://open.spotify.com/episode/${item.episode_uri}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-600"
                >
                  Listen
                </a>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AsyncEpisodeTable;