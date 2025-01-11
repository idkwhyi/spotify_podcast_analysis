'use client'
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface DataItem {
  value: number;
  name: string;
}

interface PieChartProps {
  data?: DataItem[];
  title?: string;
  subtext?: string;
}

const PieChart: React.FC<PieChartProps> = ({
  data = [
    { value: 1048, name: 'Search Engine' },
    { value: 735, name: 'Direct' },
    { value: 580, name: 'Email' },
    { value: 484, name: 'Union Ads' },
    { value: 300, name: 'Video Ads' }
  ],
  title = 'Referer of a Website',
  subtext = 'Fake Data'
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
          trigger: 'item',
          textStyle: {
            fontSize: 14,
            color: '#000',
          },
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            fontSize: 11,
            color: '#fff',
          },
        },
        series: [
          {
            name: 'Category',
            type: 'pie',
            radius: '50%',
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            textStyle: {
              fontSize: 14,
              color: '#fff',
            },
          }
        ]
      };

      chartInstance.current.setOption(option);
    }
  }, [data, title, subtext]); // Rerun when these props change

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default PieChart;