"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface DataItem {
  value: number;
  name: string;
}

interface DonutChartProps {
  data?: DataItem[];
  title: string;
  subtext: string;
  seriesName?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data = [
    { value: 1048, name: "Search Engine" },
    { value: 735, name: "Direct" },
    { value: 580, name: "Email" },
    { value: 484, name: "Union Ads" },
    { value: 300, name: "Video Ads" },
  ],
  title = "Title",
  subtext = "Subtext",
  seriesName = "Access From",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // Initialize chart
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Clean up
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    // Update chart when data changes
    if (chartInstance.current) {
      const option = {
        title: {
          text: title,
          subtext: subtext,
          left: 'center',
          textStyle: {
            fontWeight: 'bold', // Make the title bold
            fontSize: 18, // Title font size
            color: 'rgb(236, 237, 238)', // Title text color
          },
          subtextStyle: {
            fontSize: 14, // Subtitle font size
            color: 'rgb(236, 237, 238)', // Subtitle text color
          },
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          orient: "vertical",
          left: "left",
          textStyle: {
            fontSize: 14,
            color: "#fff",
          },
          formatter: (name: string) => {
            return name.charAt(0).toUpperCase() + name.slice(1); // Capitalize first letter
          },
        },
        series: [
          {
            name: "Access From",
            type: "pie",
            radius: ["40%", "70%"],
            center: ["60%", "50%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 32,
                fontWeight: "bold",
                color: "white",
                formatter: (params: { name: string }) => {
                  const name = params.name;
                  return name.charAt(0).toUpperCase() + name.slice(1); // Capitalize first letter
                },
              },
            },
            labelLine: {
              show: false,
            },
            data: data,
          },
        ],
      };

      chartInstance.current.setOption(option);
    }
  }, [data, seriesName]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default DonutChart;
