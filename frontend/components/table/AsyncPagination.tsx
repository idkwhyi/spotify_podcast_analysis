// "use client";

// import React, { useState } from "react";
// import {
//   Table,
//   TableHeader,
//   TableColumn,
//   TableBody,
//   TableRow,
//   TableCell,
//   Spinner,
// } from "@nextui-org/react";
// import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
// import { useAsyncList } from "@react-stately/data";

// interface TopEpisode {
//   top_episode_id: string;
//   rank: number;
//   chart_rank_move: "UP" | "DOWN" | "NEW";
//   date: string;
//   region_id: string;
//   episode_uri: string;
// }

// interface EpisodeDetails {
//   episode_uri: string;
//   episode_name: string;
//   episode_description: string;
//   duration_ms: string;
//   main_category: string;
//   episode_release_date: string;
//   podcast_uri: string;
//   region_id: string;
// }

// interface TopEpisodesResponse {
//   top_episodes: TopEpisode[];
// }

// interface EpisodeResponse {
//   episode: EpisodeDetails;
// }

// type CombinedEpisodeData = TopEpisode & EpisodeDetails;

// type LoadParams = {
//   signal?: AbortSignal;
//   cursor?: string;
// };

// const AsyncEpisodeTable = () => {
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [hasMore, setHasMore] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchEpisodeDetails = async (
//     episodeUri: string
//   ): Promise<EpisodeDetails | null> => {
//     try {
//       console.log("Fetching episode details for URI:", episodeUri);
//       const response = await fetch(
//         `http://127.0.0.1:5000/api/episode/${episodeUri}`
//       );
//       if (!response.ok) {
//         console.error(
//           "Error with response:",
//           response.status,
//           response.statusText
//         );
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data: EpisodeResponse = await response.json();
//       console.log("Fetched data:", data);
//       return data.episode;
//     } catch (error) {
//       console.error("Fetch error for episode details:", error);
//       return null;
//     }
//   };

//   const list = useAsyncList<CombinedEpisodeData>({
//     async load({ signal, cursor }: LoadParams) {
//       try {
//         if (!cursor) {
//           setIsLoading(true);
//         }
//         setError(null);

//         const response = await fetch(
//           cursor || "http://127.0.0.1:5000/api/top_episodes/",
//           { signal }
//         );
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const json: TopEpisodesResponse = await response.json();

//         if (!json.top_episodes || !Array.isArray(json.top_episodes)) {
//           throw new Error("Invalid API response format");
//         }

//         const today = new Date().toISOString().split("T")[0];

//         const episodeDetailsPromises = json.top_episodes.map((episode) =>
//           fetchEpisodeDetails(episode.episode_uri)
//         );
//         const episodeDetailsResults = await Promise.all(episodeDetailsPromises);

//         const enhancedResults = json.top_episodes
//           .map((episode, index) => {
//             const details = episodeDetailsResults[index];
//             if (!details) return null;

//             // Parse the date correctly
//             const episodeDate = new Date(details.episode_release_date)
//               .toISOString()
//               .split("T")[0];
//             return {
//               ...episode,
//               ...details,
//               date: episodeDate, // Add parsed date
//             };
//           })
//           .filter((item) => item?.date === today);

//         setHasMore(false); // Set to true if you implement pagination
//         setIsLoading(false);

//         return {
//           items: enhancedResults,
//           cursor: undefined, // Update this if you implement pagination
//         };
//       } catch (error) {
//         const errorMessage =
//           error instanceof Error ? error.message : "An unknown error occurred";
//         console.error("Error loading data:", errorMessage);
//         setError(errorMessage);
//         setIsLoading(false);
//         return {
//           items: [],
//           cursor: undefined,
//         };
//       }
//     },
//   });

//   const [loaderRef, scrollerRef] = useInfiniteScroll({
//     hasMore,
//     onLoadMore: list.loadMore,
//   });

//   const tableColumnStyle = "text-left z-20 p-2 bg-obsidianShadow rounded-lg";

//   const getRankChangeDisplay = (change: "UP" | "DOWN" | "NEW") => {
//     switch (change) {
//       case "UP":
//         return <span className="text-green-500">↑ Up</span>;
//       case "DOWN":
//         return <span className="text-red-500">↓ Down</span>;
//       case "NEW":
//         return <span className="text-blue-500">New</span>;
//       default:
//         return change;
//     }
//   };

//   if (error) {
//     return (
//       <div className="text-red-500 p-4 space-y-2">
//         <div>Error loading episodes: {error}</div>
//         <button
//           onClick={() => list.reload()}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <Table
//       isHeaderSticky
//       aria-label="Episode rankings table with infinite pagination"
//       baseRef={scrollerRef}
//       bottomContent={
//         hasMore ? (
//           <div className="flex w-full justify-center">
//             <Spinner ref={loaderRef} color="white" />
//           </div>
//         ) : null
//       }
//       classNames={{
//         base: "max-h-[520px] overflow-scroll bg-background scrollbar-hide",
//         table: "min-h-[400px] bg-background",
//         thead: "bg-obsidianShadow",
//         th: "bg-obsidianShadow",
//         tr: "bg-background hover:bg-lime-900/50",
//         td: "bg-transparent",
//         wrapper: "bg-background",
//       }}
//       className="border border-borderColor rounded-xl bg-background"
//     >
//       <TableHeader>
//         <TableColumn key="rank" className={tableColumnStyle}>
//           Rank
//         </TableColumn>
//         <TableColumn key="episode_name" className={tableColumnStyle}>
//           Episode Name
//         </TableColumn>
//         <TableColumn key="chart_rank_move" className={tableColumnStyle}>
//           Rank Change
//         </TableColumn>
//         <TableColumn key="region_id" className={tableColumnStyle}>
//           Region
//         </TableColumn>
//         <TableColumn key="episode_uri" className={tableColumnStyle}>
//           Episode Link
//         </TableColumn>
//       </TableHeader>
//       <TableBody
//         isLoading={isLoading}
//         items={list.items}
//         loadingContent={<Spinner color="white" />}
//         className="bg-background"
//       >
//         {(item) => (
//           <TableRow
//             key={item.episode_uri}
//             className="border-b border-b-borderColor"
//           >
//             <TableCell className="p-2">{item.rank}</TableCell>
//             <TableCell className="p-2">{item.episode_name}</TableCell>
//             <TableCell className="p-2">
//               {getRankChangeDisplay(item.chart_rank_move)}
//             </TableCell>
//             <TableCell className="p-2">{item.region_id}</TableCell>
//             <TableCell className="p-2">
//               <a
//                 href={`https://open.spotify.com/episode/${item.episode_uri}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-500 hover:text-blue-700"
//               >
//                 Listen
//               </a>
//             </TableCell>
//           </TableRow>
//         )}
//       </TableBody>
//     </Table>
//   );
// };

// export default AsyncEpisodeTable;

// ! GPT
// 'use client';

// import React, { useState } from "react";
// import {
//   Table,
//   TableHeader,
//   TableColumn,
//   TableBody,
//   TableRow,
//   TableCell,
//   Spinner,
// } from "@nextui-org/react";
// import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
// import { useAsyncList } from "@react-stately/data";

// interface TopEpisode {
//   top_episode_id: string;
//   rank: number;
//   chart_rank_move: "UP" | "DOWN" | "NEW";
//   date: string;
//   region_id: string;
//   episode_uri: string;
// }

// interface EpisodeDetails {
//   episode_uri: string;
//   episode_name: string;
//   episode_description: string;
//   duration_ms: string;
//   main_category: string;
//   episode_release_date: string;
//   podcast_uri: string;
//   region_id: string;
// }

// interface TopEpisodesResponse {
//   top_episodes: TopEpisode[];
// }

// interface EpisodeResponse {
//   episode: EpisodeDetails;
// }

// type CombinedEpisodeData = TopEpisode & EpisodeDetails;

// type LoadParams = {
//   signal?: AbortSignal;
//   cursor?: string;
// };

// const AsyncEpisodeTable = () => {
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [hasMore, setHasMore] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchEpisodeDetails = async (episodeUri: string): Promise<EpisodeDetails | null> => {
//     try {
//       const response = await fetch(`http://127.0.0.1:5000/api/episode/${episodeUri}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data: EpisodeResponse = await response.json();
//       return data.episode; // Access the episode object from the response
//     } catch (error) {
//       console.error("Error fetching episode details:", error);
//       return null;
//     }
//   };

//   const list = useAsyncList<CombinedEpisodeData>({
//     async load({ signal, cursor }: LoadParams) {
//       try {
//         if (!cursor) {
//           setIsLoading(true);
//         }
//         setError(null);

//         const response = await fetch(
//           cursor || "http://127.0.0.1:5000/api/top_episodes/",
//           { signal }
//         );
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const json: TopEpisodesResponse = await response.json();

//         if (!json.top_episodes || !Array.isArray(json.top_episodes)) {
//           throw new Error("Invalid API response format");
//         }

//         const today = new Date().toISOString().split("T")[0];

//         const episodeDetailsPromises = json.top_episodes.map((episode) =>
//           fetchEpisodeDetails(episode.episode_uri)
//         );
//         const episodeDetailsResults = await Promise.all(episodeDetailsPromises);

//         const enhancedResults = json.top_episodes
//           .map((episode, index) => {
//             const details = episodeDetailsResults[index];
//             if (!details) return null;

//             return {
//               ...episode,
//               ...details,
//             };
//           })
//           .filter((item): item is CombinedEpisodeData => item !== null && item.date === today);

//         setHasMore(false); // Set to true if you implement pagination
//         setIsLoading(false);

//         return {
//           items: enhancedResults,
//           cursor: undefined, // Update this if you implement pagination
//         };
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//         console.error("Error loading data:", errorMessage);
//         setError(errorMessage);
//         setIsLoading(false);
//         return {
//           items: [],
//           cursor: undefined,
//         };
//       }
//     },
//   });

//   const [loaderRef, scrollerRef] = useInfiniteScroll({
//     hasMore,
//     onLoadMore: list.loadMore,
//   });

//   const tableColumnStyle = "text-left z-20 p-2 bg-obsidianShadow rounded-lg";

//   const getRankChangeDisplay = (change: "UP" | "DOWN" | "NEW") => {
//     switch (change) {
//       case "UP":
//         return <span className="text-green-500">↑ Up</span>;
//       case "DOWN":
//         return <span className="text-red-500">↓ Down</span>;
//       case "NEW":
//         return <span className="text-blue-500">New</span>;
//       default:
//         return change;
//     }
//   };

//   if (error) {
//     return (
//       <div className="text-red-500 p-4 space-y-2">
//         <div>Error loading episodes: {error}</div>
//         <button
//           onClick={() => list.reload()}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <Table
//       isHeaderSticky
//       aria-label="Episode rankings table with infinite pagination"
//       baseRef={scrollerRef}
//       bottomContent={
//         hasMore ? (
//           <div className="flex w-full justify-center">
//             <Spinner ref={loaderRef} color="white" />
//           </div>
//         ) : null
//       }
//       classNames={{
//         base: "max-h-[520px] overflow-scroll bg-background scrollbar-hide",
//         table: "min-h-[400px] bg-background",
//         thead: "bg-obsidianShadow",
//         th: "bg-obsidianShadow",
//         tr: "bg-background hover:bg-lime-900/50",
//         td: "bg-transparent",
//         wrapper: "bg-background",
//       }}
//       className="border border-borderColor rounded-xl bg-background"
//     >
//       <TableHeader>
//         <TableColumn key="rank" className={tableColumnStyle}>
//           Rank
//         </TableColumn>
//         <TableColumn key="episode_name" className={tableColumnStyle}>
//           Episode Name
//         </TableColumn>
//         <TableColumn key="chart_rank_move" className={tableColumnStyle}>
//           Rank Change
//         </TableColumn>
//         <TableColumn key="region_id" className={tableColumnStyle}>
//           Region
//         </TableColumn>
//         <TableColumn key="episode_uri" className={tableColumnStyle}>
//           Episode Link
//         </TableColumn>
//       </TableHeader>
//       <TableBody
//         isLoading={isLoading}
//         items={list.items}
//         loadingContent={<Spinner color="white" />}
//         className="bg-background"
//       >
//         {(item) => (
//           <TableRow
//             key={`${item.episode_uri}-${item.rank}`}
//             className="border-b border-b-borderColor"
//           >
//             <TableCell className="p-2">{item.rank}</TableCell>
//             <TableCell className="p-2">{item.episode_name}</TableCell>
//             <TableCell className="p-2">
//               {getRankChangeDisplay(item.chart_rank_move)}
//             </TableCell>
//             <TableCell className="p-2">{item.region_id}</TableCell>
//             <TableCell className="p-2">
//               <a
//                 href={`https://open.spotify.com/episode/${item.episode_uri}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-500 hover:text-blue-700"
//               >
//                 Listen
//               </a>
//             </TableCell>
//           </TableRow>
//         )}
//       </TableBody>
//     </Table>
//   );
// };

// export default AsyncEpisodeTable;

// ! Claude
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

interface TopEpisode {
  top_episode_id: string;
  rank: number;
  chart_rank_move: "UP" | "DOWN" | "NEW";
  date: string;
  region_id: string;
  episode_uri: string;
}

interface EpisodeDetails {
  episode_uri: string;
  episode_name: string;
  episode_description: string;
  duration_ms: string;
  main_category: string;
  episode_release_date: string;
  podcast_uri: string;
  region_id: string;
}

interface TopEpisodesResponse {
  top_episodes: TopEpisode[];
}

interface EpisodeResponse {
  episode: EpisodeDetails;
}

type CombinedEpisodeData = TopEpisode & EpisodeDetails;

type LoadParams = {
  signal?: AbortSignal;
  cursor?: string;
};

const AsyncEpisodeTable = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Helper function to format date consistently
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  const fetchEpisodeDetails = async (
    episodeUri: string
  ): Promise<EpisodeDetails | null> => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/episode/${episodeUri}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: EpisodeResponse = await response.json();
      return data.episode;
    } catch (error) {
      console.error("Error fetching episode details:", error);
      return null;
    }
  };

  const list = useAsyncList<CombinedEpisodeData>({
    async load({ signal, cursor }: LoadParams) {
      try {
        if (!cursor) {
          setIsLoading(true);
        }
        setError(null);

        const response = await fetch(
          cursor || "http://127.0.0.1:5000/api/top_episodes/",
          { signal }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json: TopEpisodesResponse = await response.json();

        if (!json.top_episodes || !Array.isArray(json.top_episodes)) {
          throw new Error("Invalid API response format");
        }

        console.log("Raw episodes data sample:", json.top_episodes[0]);

        // Get the most recent date from the data
        const dates = json.top_episodes.map((episode) =>
          new Date(episode.date).getTime()
        );
        const mostRecentDate = dates.length > 0 ? Math.max(...dates) : null;

        if (!mostRecentDate) {
          setDebugInfo("No dates found in the data");
          return { items: [], cursor: undefined };
        }

        const mostRecentDateStr = formatDate(
          new Date(mostRecentDate).toISOString()
        );
        console.log("Most recent date:", mostRecentDateStr);

        // Filter episodes for the most recent date
        const latestEpisodes = json.top_episodes.filter((episode) => {
          const episodeDate = formatDate(episode.date);
          const isMatch = episodeDate === mostRecentDateStr;
          return isMatch;
        });

        console.log(
          `Found ${latestEpisodes.length} episodes for ${mostRecentDateStr}`
        );

        const episodeDetailsPromises = latestEpisodes.map((episode) =>
          fetchEpisodeDetails(episode.episode_uri)
        );
        const episodeDetailsResults = await Promise.all(episodeDetailsPromises);

        const enhancedResults = latestEpisodes
          .map((episode, index) => {
            const details = episodeDetailsResults[index];
            if (!details) return null;

            return {
              ...episode,
              ...details,
            };
          })
          .filter((item): item is CombinedEpisodeData => item !== null);

        setDebugInfo(
          `Displaying ${enhancedResults.length} episodes for ${mostRecentDateStr}`
        );
        setHasMore(false);
        setIsLoading(false);

        return {
          items: enhancedResults,
          cursor: undefined,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error loading data:", errorMessage);
        setError(errorMessage);
        setDebugInfo(`Error: ${errorMessage}`);
        setIsLoading(false);
        return {
          items: [],
          cursor: undefined,
        };
      }
    },
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: list.loadMore,
  });

  const tableColumnStyle = "text-left z-20 p-2 bg-obsidianShadow rounded-lg";

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
      {debugInfo && (
        <div className="text-sm text-gray-500 p-2">{debugInfo}</div>
      )}
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
          <TableColumn key="rank" className={tableColumnStyle}>
            Rank
          </TableColumn>
          <TableColumn key="episode_name" className={tableColumnStyle}>
            Episode Name
          </TableColumn>
          <TableColumn key="chart_rank_move" className={tableColumnStyle}>
            Rank Change
          </TableColumn>
          <TableColumn key="region_id" className={tableColumnStyle}>
            Region
          </TableColumn>
          <TableColumn key="episode_uri" className={tableColumnStyle}>
            Episode Link
          </TableColumn>
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
              <TableCell className="p-2">{item.episode_name}</TableCell>
              <TableCell className="p-2">
                {getRankChangeDisplay(item.chart_rank_move)}
              </TableCell>
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
