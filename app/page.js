import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Episodes } from "@/components/Episodes";
import { Subscribe } from "@/components/Subscribe";
import { SubscribePopup } from "@/components/SubscribePopup";
import { getEpisodes } from "@/lib/rss";
import { getClipsGroupedByEpisode } from "@/lib/clips";

export default async function Page() {
  const [episodes, clipsByEpisode] = await Promise.all([
    getEpisodes(),
    getClipsGroupedByEpisode(),
  ]);

  return (
    <main>
      <Hero />
      <About />
      <Episodes episodes={episodes} clipsByEpisode={clipsByEpisode} />
      <Subscribe />
      <SubscribePopup />
    </main>
  );
}
