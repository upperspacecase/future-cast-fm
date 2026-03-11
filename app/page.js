import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Episodes } from "@/components/Episodes";
import { Subscribe } from "@/components/Subscribe";
import { SubscribePopup } from "@/components/SubscribePopup";
import { getEpisodes } from "@/lib/rss";

export default async function Page() {
  // Fetch episodes from RSS feed (server-side)
  const episodes = await getEpisodes();

  return (
    <main>
      <Hero />
      <About />
      <Episodes episodes={episodes} />
      <Subscribe />
      <SubscribePopup />
    </main>
  );
}
