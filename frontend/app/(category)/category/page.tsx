"use client";

import React, { useEffect, useState } from "react";
import {
  getCombinedEpisodeData,
  calculateCategoryCount,
} from "@/utils/api.category";
import StackedLineChart from "@/components/chart/StackedLineChart";
import EpisodeByCategory from "./EpisodeByCategory";

// Define types for chartData
interface SeriesData {
  name: string;
  data: number[];
}

interface ChartData {
  xAxisData: string[];
  seriesData: SeriesData[];
}

const Page = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null); // Use ChartData type
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const episodes = await getCombinedEpisodeData();
        const categoryCount = calculateCategoryCount(episodes);

        const xAxisData = Object.keys(categoryCount);
        const seriesData: SeriesData[] = Object.keys(categoryCount[xAxisData[0]]).map(
          (category) => ({
            name: category,
            data: xAxisData.map((date) => categoryCount[date][category] || 0),
          })
        );

        setChartData({ xAxisData, seriesData });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="h1 mt-16">Top Episodes</h1>
      <p className="text-lg">
        Displayed categories trend based on daily podcast episode
      </p>
      <div className="w-full flex flex-col gap-20">
        <div className="w-full h-auto center">
          {chartData ? (
            <StackedLineChart
              title=""
              xAxisData={chartData.xAxisData}
              seriesData={chartData.seriesData}
            />
          ) : (
            <p>Loading chart data...</p>
          )}
        </div>
        <div>
          <h2 className="h2">Episode By Category</h2>
          <EpisodeByCategory />
        </div>
      </div>
    </div>
  );
};

export default Page;
