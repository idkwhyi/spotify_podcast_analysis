import AsyncPagination from "@/components/table/AsyncPagination";

export default function Home() {
  return (
    <div className="w-full">
      <section className="w-full">
        <div className="py-4">
          <h1 className="h1 font-bold">Top Spotify Podcast Trends</h1>
          <p>The global spotify trends per days</p>
        </div>
        <div className="w-full gap-2 center">
          <div className=" w-1/3 rounded-xl border-1 border-borderColor flex flex-col p-4 gap-2">
            <h2 className="font-bold h4">🔥 Trending Episode</h2>
            <div>Trending episode</div>
            <div>Trending episode</div>
            <div>Trending episode</div>
          </div>
          <div className=" w-1/3 rounded-xl border-1 border-borderColor flex flex-col p-4 gap-2">
            <h2 className="font-bold h4">🚀 Trending Podcast</h2>
            <div>Trending episode</div>
            <div>Trending episode</div>
            <div>Trending episode</div>
          </div>
          <div className=" w-1/3 rounded-xl border-1 border-borderColor flex flex-col p-4 gap-2">
            <h2 className="font-bold h4">Categories</h2>
            <div>Trending episode</div>
            <div>Trending episode</div>
            <div>Trending episode</div>
          </div>
        </div>
      </section>
      <section className="mt-5">
        <AsyncPagination/>
      </section>
      
    </div>
  );
}
