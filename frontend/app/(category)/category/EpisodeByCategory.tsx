"use client";
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
import { formatDate } from "@/utils/api.episode";

// Interface untuk data kategori dan episode
interface Category {
  id: string; // Ensure `id` is a string
  name: string; // This will be used to display the category name
  category_name: string; // Assuming `category_name` is the key from the API response
}



// interface Episode {
//   episode_uri?: string;
//   episode_name?: string;
//   episode_description?: string;
//   rank?: number;
//   chart_rank_move?: "UP" | "DOWN" | "NEW";
//   duration_ms?: string;
//   episode_release_date?: string; // Add release_date here
//   main_category?: string;
// }

interface Episode {
  episode_uri: string;
  episode_name: string;
  episode_description: string;
  rank: number;
  chart_rank_move: "UP" | "DOWN" | "NEW";
  duration_ms: string;
  episode_release_date: string; // Ensure this field exists in the interface
  main_category: string;
}

const EpisodeByCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]); // Data kategori
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // Kategori yang dipilih
  const [episodes, setEpisodes] = useState<Episode[]>([]); // Data episode
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const baseUrl = "http://127.0.0.1:5000/api"; // Base URL for the API

  // Fetch categories data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseUrl}/category/all`); // Correct API URL for fetching categories
        const data = await res.json();

        const categoriesList = data.categories.map(
          (category: Category, index: number) => ({
            id: index.toString(), // If you need an id, you can use the index or another unique value
            name: category.category_name, // Map category_name to name
          })
        );

        setCategories(categoriesList); // Set categories state

        // Set default selected category to the first category (if any categories exist)
        if (categoriesList.length > 0) {
          setSelectedCategory(categoriesList[0].name); // Set default to first category's id
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  // Fetch episodes by selected category
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedCategory) return;
      console.info("SELECTED", selectedCategory);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${baseUrl}/episode/category/${selectedCategory}`
        ); // Correct API URL for fetching episodes by category
        const data = await res.json();
        setEpisodes(data.episodes); // Assuming the API returns an object with an `episodes` field
      } catch (err) {
        setError("Failed to fetch episode data");
        console.error("Error fetching episodes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [selectedCategory]); // Fetch episodes when selectedCategory changes

  // Format episode duration
  const formatDuration = (ms: string) => {
    const minutes = Math.floor(parseInt(ms) / 60000);
    const seconds = Math.floor((parseInt(ms) % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Columns for the episode table
  const columns = [
    { key: "episode_name", label: "Episode Name" },
    // { key: "episode_description", label: "Description" },
    { key: "rank", label: "Rank" },
    { key: "chart_rank_move", label: "Chart Move" },
    { key: "duration_ms", label: "Duration" },
    { key: "episode_release_date", label: "Release Date" },
    { key: "main_category", label: "Main Category" },
  ];

  const capitalizeWords = (str: string) => {
    return str
      .split(" ") // Memisahkan string berdasarkan spasi
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Membuat huruf pertama kapital
      .join(" "); // Menggabungkan kembali kata-kata menjadi string
  };

  const tableColumnStyle =
    "text-left z-20 p-2 bg-obsidianShadow border border-borderColor";

  const tableItemsStyle = "p-2 border border-borderColor px-2"

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
            <option key={category.id} value={category.id}>
              {capitalizeWords(category.name)}
            </option>
          ))}
        </select>
      </div>

      {/* Display error if any */}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Display loading message if data is loading */}
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
                <TableRow
                  key={item.episode_uri}
                  className={tableItemsStyle}
                >
                  {(columnKey) => {
                    if (columnKey === "duration_ms") {
                      // Ensure columnKey is a string before using it to access item
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
                        <TableCell>
                          <a
                            href={`http://localhost:3000/episode/${item.episode_uri}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item[columnKey as keyof Episode]}
                          </a>
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell>{getKeyValue(item, columnKey)}</TableCell>
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
