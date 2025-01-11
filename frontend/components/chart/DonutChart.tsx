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
          left: "center",
          textStyle: {
            fontWeight: "bold", // Make the title bold
            fontSize: 18, // Title font size
            color: "rgb(236, 237, 238)", // Title text color
          },
          subtextStyle: {
            fontSize: 14, // Subtitle font size
            color: "rgb(236, 237, 238)", // Subtitle text color
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
            radius: ["10%", "70%"],
            center: ["60%", "50%"],
            // center: ["60%", "50%"],
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
        color: [
          "rgb(203, 208, 222)",
          "rgb(149, 154, 183)",
          "rgb(123, 130, 158)",
          "rgb(97, 106, 134)",
          "rgb(59, 64, 92)",
          "rgb(39, 43, 71)",
          "rgb(218, 230, 252)",
          "rgb(200, 217, 250)",
          "rgb(182, 204, 248)",
          "rgb(164, 191, 246)",
          "rgb(146, 178, 244)",
          "rgb(128, 165, 242)",
          "rgb(110, 152, 240)",
          "rgb(92, 139, 238)",
          "rgb(74, 126, 236)",
          "rgb(164,204,249)",
          "rgb(121,206, 224)",
          "rgb(162, 209, 191)",
          "rgb(149, 159, 248)",
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


// Base Color: rgb(121, 206, 224)

// 10%: rgb(236, 247, 250)
// 20%: rgb(213, 233, 242)
// 30%: rgb(190, 220, 235)
// 40%: rgb(166, 206, 227)
// 50%: rgb(143, 193, 220)
// 60%: rgb(121, 180, 212)
// 70%: rgb(98, 167, 205)
// 80%: rgb(75, 153, 197)
// 90%: rgb(52, 140, 190)
// 100%: rgb(29, 126, 182)
// Base Color: rgb(162, 209, 191)

// 10%: rgb(235, 246, 239)
// 20%: rgb(215, 236, 223)
// 30%: rgb(195, 225, 208)
// 40%: rgb(175, 215, 192)
// 50%: rgb(156, 204, 177)
// 60%: rgb(137, 194, 161)
// 70%: rgb(118, 184, 146)
// 80%: rgb(98, 173, 131)
// 90%: rgb(79, 163, 115)
// 100%: rgb(60, 153, 100)
// Base Color: rgb(149, 159, 248)

// 10%: rgb(224, 228, 252)
// 20%: rgb(203, 209, 250)
// 30%: rgb(182, 189, 248)
// 40%: rgb(161, 170, 246)
// 50%: rgb(141, 150, 244)
// 60%: rgb(120, 130, 242)
// 70%: rgb(99, 111, 240)
// 80%: rgb(78, 91, 238)
// 90%: rgb(58, 71, 236)
// 100%: rgb(37, 51, 234)