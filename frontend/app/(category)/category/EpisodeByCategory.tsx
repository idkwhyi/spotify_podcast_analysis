"use client"

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";

interface Category {
  id: string;
  name: string;
  category_name: string;
}

interface TopEpisode {
  top_episode_id: string;
  rank: number;
  chart_rank_move: "UP" | "DOWN" | "NEW";
  date: string;
  region_id: string;
  episode_uri: string;
}

interface Episode {
  episode_uri: string;
  episode_name: string;
  episode_description: string;
  rank?: number;
  chart_rank_move?: "UP" | "DOWN" | "NEW";
  duration_ms: string;
  episode_release_date: string;
  main_category: string;
}

const EpisodeByCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [topEpisodes, setTopEpisodes] = useState<TopEpisode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = "http://127.0.0.1:5000/api";

  // Fetch top episodes
  useEffect(() => {
    const fetchTopEpisodes = async () => {
      try {
        const res = await fetch(`${baseUrl}/top_episodes`);
        const data = await res.json();
        // Sort by date to get the most recent rankings
        const sortedEpisodes = data.top_episodes.sort((a: TopEpisode, b: TopEpisode) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTopEpisodes(sortedEpisodes);
      } catch (err) {
        console.error("Error fetching top episodes:", err);
      }
    };

    fetchTopEpisodes();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseUrl}/category/all`);
        const data = await res.json();

        const categoriesList = data.categories.map(
          (category: { category_name: string }, index: number) => ({
            id: index.toString(),
            name: category.category_name,
            category_name: category.category_name
          })
        );

        setCategories(categoriesList);

        if (categoriesList.length > 0) {
          setSelectedCategory(categoriesList[0].category_name);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedCategory) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${baseUrl}/episode/category/${encodeURIComponent(selectedCategory)}`
        );
        const data = await res.json();
        
        // Merge episode data with top episodes data
        const mergedEpisodes = data.episodes.map((episode: Episode) => {
          const topEpisodeData = topEpisodes.find(
            (topEp) => topEp.episode_uri === episode.episode_uri
          );
          
          return {
            ...episode,
            rank: topEpisodeData?.rank || null,
            chart_rank_move: topEpisodeData?.chart_rank_move || null
          };
        });

        setEpisodes(mergedEpisodes);
      } catch (err) {
        setError("Failed to fetch episode data");
        console.error("Error fetching episodes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [selectedCategory, topEpisodes]);

  const formatDuration = (ms: string) => {
    const minutes = Math.floor(parseInt(ms) / 60000);
    const seconds = Math.floor((parseInt(ms) % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getRankMoveIcon = (move: string | undefined) => {
    if (!move) return "-";
    switch (move) {
      case "UP":
        return "↑";
      case "DOWN":
        return "↓";
      case "NEW":
        return "NEW";
      default:
        return "-";
    }
  };

  const getRankMoveColor = (move: string | undefined) => {
    if (!move) return "text-gray-500";
    switch (move) {
      case "UP":
        return "text-green-500";
      case "DOWN":
        return "text-red-500";
      case "NEW":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const columns = [
    { key: "episode_name", label: "Episode Name" },
    { key: "rank", label: "Rank" },
    { key: "chart_rank_move", label: "Chart Move" },
    { key: "duration_ms", label: "Duration" },
    { key: "episode_release_date", label: "Release Date" },
    { key: "main_category", label: "Main Category" },
  ];

  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const tableColumnStyle = "text-left z-20 p-2 bg-obsidianShadow border border-borderColor";
  const tableItemsStyle = "p-2 border border-borderColor px-2";

  return (
    <div>
      <div className="bg-background w-auto flex justify-end px-12 gap-5">
        <label htmlFor="category-select">Select Category: </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-obsidianShadow border border-foreground rounded-lg"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.category_name}>
              {capitalizeWords(category.name)}
            </option>
          ))}
        </select>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {loading ? (
        <div>Loading episodes...</div>
      ) : (
        <div className="table-wrapper">
          <Table aria-label="Podcast Episodes Table">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn className={tableColumnStyle} key={column.key}>
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={episodes}>
              {(item) => (
                <TableRow key={item.episode_uri} className={tableItemsStyle}>
                  {(columnKey) => {
                    if (columnKey === "duration_ms") {
                      const duration = item[columnKey as keyof Episode];
                      if (typeof duration === "string") {
                        return (
                          <TableCell className={tableItemsStyle}>
                            {formatDuration(duration)}
                          </TableCell>
                        );
                      }
                      return <TableCell className={tableItemsStyle}>Invalid Duration</TableCell>;
                    }
                    if (columnKey === "episode_release_date") {
                      const releaseDate = item[columnKey as keyof Episode];
                      if (typeof releaseDate === "string") {
                        return (
                          <TableCell className={tableItemsStyle}>
                            {formatDate(releaseDate)}
                          </TableCell>
                        );
                      }
                      return <TableCell className={tableItemsStyle}>Invalid Date</TableCell>;
                    }
                    if (columnKey === "episode_name") {
                      return (
                        <TableCell className={tableItemsStyle}>
                          <a
                            href={`http://localhost:3000/episode/${item.episode_uri}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400"
                          >
                            {item[columnKey as keyof Episode]}
                          </a>
                        </TableCell>
                      );
                    }
                    if (columnKey === "chart_rank_move") {
                      return (
                        <TableCell className={tableItemsStyle}l>
                          <span className={getRankMoveColor(item.chart_rank_move)}>
                            {getRankMoveIcon(item.chart_rank_move)}
                          </span>
                        </TableCell>
                      );
                    }
                    if (columnKey === "rank") {
                      return (
                        <TableCell className={tableItemsStyle}>
                          {item.rank || "-"}
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell className={tableItemsStyle}>{getKeyValue(item, columnKey)}</TableCell>
                    );
                  }}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EpisodeByCategory;