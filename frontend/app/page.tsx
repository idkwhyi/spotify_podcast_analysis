"use client";

import AsyncPagination from "@/components/table/AsyncPagination";
// import PieChart from "@/components/chart/PieChart";
import TrendingEpisode from "@/components/trending/TrendingEpisode";
import TrendingCategory from "@/components/trending/TrendingCategory";
import TrendingPodcast from "@/components/trending/TrendingPodcast";

export default function Home() {
  // const customData = [
  //   { value: 1048, name: "Search Engine" },
  //   { value: 735, name: "Direct" },
  //   // ... more data
  // ];

  return (
    <div className="w-full bg-background text-foreground">
      <section className="w-full">
        <div className="py-4">
          <h1 className="h1 font-bold">Top Spotify Podcast Trends</h1>
          <p>The global spotify trends per days</p>
        </div>
        {/* Information */}
        <div className="w-full gap-2 flex flecenter h-max">
          {/* Trending episodes */}
          <div className=" w-1/2 rounded-xl border-1 border-borderColor bg-obsidianShadow flex flex-col p-4 gap-2 max-h-[25rem]">
            <h2 className="font-bold h4">🔥 Trending Episode</h2>
            <TrendingEpisode />
          </div>

          {/* Trending podcast */}
          <div className=" w-1/2 rounded-xl border-1 border-borderColor flex flex-col p-4 gap-2 bg-obsidianShadow max-h-[25rem]">
            <h2 className="font-bold h4">🚀 Trending Podcast</h2>
            <TrendingPodcast/>
          </div>

          {/* Chart */}
        </div>

        {/* Chart */}
        <div className=" w-full rounded-xl border-1 border-borderColor flex flex-col p-4 mt-2 bg-obsidianShadow gap-2">
          <h2 className="font-bold h4">📊 Categories</h2>
          <TrendingCategory />
        </div>

      </section>

      <section className="mt-5 bg-background">
        <AsyncPagination />
      </section>

    </div>
  );
}
