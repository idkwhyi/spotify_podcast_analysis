"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface SeriesDataItem {
  name: string;
  data: number[];
}

interface StackedLineChartProps {
  title?: string;
  xAxisData?: string[];
  seriesData?: SeriesDataItem[];
}

const StackedLineChart: React.FC<StackedLineChartProps> = ({
  title = "Stacked Line Chart",
  xAxisData = [],
  seriesData = [],
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // Initialize chart
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Clean up function
    return () => {
      chartInstance.current?.dispose();
    };
  }, []); // Only run once on mount

  useEffect(() => {
    if (chartInstance.current) {
      const option = {
        title: {
          text: title,
          left: "center",
          textStyle: {
            fontWeight: "bold",
            fontSize: 18,
            color: "rgb(236, 237, 238)",
          },
        },
        tooltip: {
          trigger: "axis",
          textStyle: {
            fontSize: 14,
            color: "#000",
          },
          formatter: (params: any) => {
            // Ambil data tanggal dari parameter (sesuaikan dengan struktur data Anda)
            const date = params[0].axisValueLabel; // Gunakan `axisValueLabel` untuk tanggal jika ada di axis
            const sortedParams = params.sort(
              (a: any, b: any) => b.data - a.data
            );

            // Format elemen tooltip untuk setiap data
            const tooltipItems = sortedParams.map(
              (item: any) => `
              <div style="
                display: flex; 
                align-items: center; 
                margin-bottom: 4px; 
                gap: 8px;
                width: 33%; /* Atur lebar tiap item agar menyesuaikan kolom */
              ">
                <span 
                  style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${item.color};">
                </span>
                <span style="font-weight: normal; color: #333;">${item.seriesName}:</span>
                <span style="color: #000;">${item.data}</span>
              </div>
            `
            );

            // Gabungkan tanggal dan elemen tooltip
            return `
              <div style="
                display: flex; 
                flex-direction: column; 
                max-width: 600px; 
                padding: 10px; 
                background-color: #fff; 
                border-radius: 8px; 
                box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1); 
                font-size: 12px;
                line-height: 1.5;
              ">
                <div style="font-weight: bold; margin-bottom: 8px; color: #333;">
                  Date: ${date}
                </div>
                <div style="display: flex; flex-wrap: wrap;">
                  ${tooltipItems.join("")}
                </div>
              </div>
            `;
          },
          axisPointer: {
            type: "line",
            lineStyle: {
              color: "#aaa",
            },
          },
          extraCssText:
            "max-width: 600px; white-space: normal; word-wrap: break-word;",
        },

        legend: {
          type: "scroll", // Membuat legend scrollable
          data: seriesData.map((series) => series.name),
          left: "right", // Memindahkan legend ke kanan
          top: "center", // Legend berada di tengah secara vertikal
          orient: "vertical", // Orientasi legend secara vertikal
          textStyle: {
            fontSize: 12,
            color: "#fff",
          },
          pageIconColor: "#fff", // Warna ikon scroll
          itemGap: 10, // Jarak antar item legend
        },
        grid: {
          left: "3%",
          right: "20%", // Memberikan ruang lebih untuk legend di kanan
          bottom: "10%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: xAxisData,
          inverse: true,
        },
        yAxis: {
          type: "value",
        },
        dataZoom: [
          {
            type: "slider",
            show: true,
            xAxisIndex: 0,
            start: 0,
            end: 100,
          },
          {
            type: "inside",
            xAxisIndex: 0,
            start: 0,
            end: 100,
          },
        ],
        series: seriesData.map((series) => ({
          name: series.name,
          type: "line",
          stack: "Total",
          data: series.data,
        })),
      };

      chartInstance.current.setOption(option);
    }
  }, [title, xAxisData, seriesData]);

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

export default StackedLineChart;
