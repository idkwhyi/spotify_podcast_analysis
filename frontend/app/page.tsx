import AsyncPagination from "@/components/table/AsyncPagination";
import PieChart from "@/components/chart/PieChart";

export default function Home() {
  const customData = [
    { value: 1048, name: "Search Engine" },
    { value: 735, name: "Direct" },
    // ... more data
  ];

  return (
    <div className="w-full bg-background text-foreground">
      <section className="w-full">
        <div className="py-4">
          <h1 className="h1 font-bold">Top Spotify Podcast Trends</h1>
          <p>The global spotify trends per days</p>
        </div>
        <div className="w-full gap-2 center h-max">

          {/* Trending episodes */}
          <div className=" w-1/3 rounded-xl border-1 border-borderColor bg-obsidianShadow flex flex-col p-4 gap-2 min-h-[25rem]">
            <h2 className="font-bold h4">🔥 Trending Episode</h2>
            <div>Trending episode</div>
            <div>Trending episode</div>
            <div>Trending episode</div>
          </div>

          {/* Trending podcast */}
          <div className=" w-1/3 rounded-xl border-1 border-borderColor flex flex-col p-4 gap-2 bg-obsidianShadow min-h-[25rem]">
            <h2 className="font-bold h4">🚀 Trending Podcast</h2>
            <div>Trending episode</div>
            <div>Trending episode</div>
            <div>Trending episode</div>
          </div>

          {/* Chart */}
          <div className=" w-1/3 rounded-xl border-1 border-borderColor flex flex-col p-4 gap-2 bg-obsidianShadow max-h-[25rem]">
            <h2 className="font-bold h4">Categories</h2>
            <PieChart
              data={customData}
              title=""
              subtext="Trending Categories"
            />
          </div>
        </div>
      </section>

      <section className="mt-5 bg-background">
        <AsyncPagination />
      </section>
    </div>
  );
}
