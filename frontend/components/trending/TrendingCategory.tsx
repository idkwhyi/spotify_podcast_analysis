'use client'
import React, { useEffect, useState } from 'react';
import DonutChart from '../chart/DonutChart';

interface CategoryData {
  data: Array<{
    value: number;
    name: string;
  }>;
  title: string;
  subtext: string;
}

const TrendingCategory: React.FC = () => {
  const [chartData, setChartData] = useState<CategoryData | null>(null);
  const [mostFrequentCategory, setMostFrequentCategory] = useState<{ name: string; value: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/charts/category-distribution');
        if (!response.ok) {
          throw new Error('Failed to fetch category data');
        }
        const data = await response.json();
        setChartData(data);

        // Map category data
        const countCategory = data.data.map((ct: { value: number; name: string; }) => ({
          value: ct.value,
          name: ct.name,
        }));

        // Find the most frequent category and its amount
        const mostFrequent = countCategory.reduce((max: { value: number; }, item: { value: number; }) => (item.value > max.value ? item : max), countCategory[0]);
        setMostFrequentCategory(mostFrequent);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!chartData) {
    return <div className="text-center">No data available</div>;
  }

  return (
    <div className="w-full h-full ">
      {mostFrequentCategory && (
        <p className="text-left text-lg my-4">
          Most Popular category:  <span className="font-semibold text-primary">{mostFrequentCategory.name.charAt(0).toUpperCase() + mostFrequentCategory.name.slice(1)}</span> -{' '}
          <span className="font-semibold text-primary">({mostFrequentCategory.value})</span>
        </p>
      )}

      <DonutChart 
        data={chartData.data}
        title={chartData.title}
        subtext={chartData.subtext}
        seriesName="Category Distribution"
      />
    </div>
  );
};

export default TrendingCategory;