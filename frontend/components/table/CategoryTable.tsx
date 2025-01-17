import React, { useEffect, useState } from "react";
import {
  getCombinedEpisodeData,
  calculateCategoryCount,
} from "@/utils/api.category";

const CategoryTable = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [topCategories, setTopCategories] = useState<{ category: string; count: number; rank: number }[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get Category and count category
        const episodes = await getCombinedEpisodeData();
        const categoryCount = calculateCategoryCount(episodes);


        // Find the latest date
        const latestDate = Object.keys(categoryCount)
          .map((date) => new Date(date))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        const latestDateStr = latestDate.toUTCString();
        const latestCategories = categoryCount[latestDateStr];

        if (latestCategories) {
          // Convert to sortable array
          const sortedCategories = Object.entries(latestCategories)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);

          // Add rank
          const rankedCategories = sortedCategories.map((item, index) => ({
            ...item,
            rank: index + 1,
          }));

          setTopCategories(rankedCategories);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Top Categories - Latest Day</h1>
      {topCategories ? (
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Rank</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Count</th>
            </tr>
          </thead>
          <tbody>
            {topCategories.map(({ category, count, rank }) => (
              <tr key={category}>
                <td className="border border-gray-300 px-4 py-2 text-center">{rank}</td>
                <td className="border border-gray-300 px-4 py-2">{category}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No categories available for the latest day.</div>
      )}
    </div>
  );
};

export default CategoryTable;
