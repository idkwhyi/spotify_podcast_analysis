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


const AsyncEpisodeTable = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
        
        // Filter episodes for the most recent date
        const latestEpisodes = json.top_episodes.filter(episode => {
          const episodeDate = formatDate(episode.date);
          return episodeDate === mostRecentDateStr;
        });

        const episodeDetailsPromises = latestEpisodes.map(episode =>
          fetchEpisodeDetails(episode.episode_uri)
        );
        const episodeDetailsResults = await Promise.all(episodeDetailsPromises);

        const enhancedResults = latestEpisodes.map((episode, index) => {
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

  const getRankChangeDisplay = (change: "UP" | "DOWN" | "NEW") => {
    switch (change) {
      case "UP":
        return <span className="text-green-500">↑ Up</span>;
      case "DOWN":
        return <span className="text-red-500">↓ Down</span>;
      case "NEW":
        return <span className="text-blue-500">New</span>;
      default:
        return change;
    }
  };

  if (error) {
    return (
      <div className="text-red-500 p-4 space-y-2">
        <div>Error loading episodes: {error}</div>
        <div className="text-sm text-gray-500">{debugInfo}</div>
        <button
          onClick={() => list.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {debugInfo && <div className="text-sm text-gray-500 p-2">{debugInfo}</div>}
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
          loadingContent={<Spinner color="white" />}
          className="bg-background"
        >
          {(item) => (
            <TableRow 
              key={`${item.episode_uri}-${item.rank}`} 
              className="border-b border-b-borderColor"
            >
              <TableCell className="p-2">{item.rank}</TableCell>
              <TableCell className="p-2">
                <Link
                  href={`/episode/${item.episode_uri}`}
                  className="text-blue-500 hover:text-blue-700 cursor-pointer"
                >
                  {item.episode_name}
                </Link>
              </TableCell>
              <TableCell className="p-2">{getRankChangeDisplay(item.chart_rank_move)}</TableCell>
              <TableCell className="p-2">{item.region_id}</TableCell>
              <TableCell className="p-2">
                <a
                  href={`https://open.spotify.com/episode/${item.episode_uri}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
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