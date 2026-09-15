import Link from "next/link";
import CardVideo from "@/components/shared/CardVideo";

export default function Hero() {
  return (
    <section className="hero" id="top">
      {/* The poster is the Largest Contentful Paint element on this page. An
          image referenced only by a `poster` attribute is fetched at low
          priority until layout proves it is on screen; this says so up front.
          React hoists the tag into <head>. */}
      <link rel="preload" as="image" href="/images/hero-poster.webp" fetchPriority="high" />
      <div className="herobg">
        {/* The one video on screen at first paint, so it carries both the
            poster that stands in for it and the deferral that keeps it out of
            the critical path. */}
        <CardVideo src="/videos/hero-demo1.mp4" poster="/images/hero-poster.webp" deferred />
        <div className="herobgshade" />
      </div>

      <div className="herowrap">
        <div>
          <div className="kicker">[ Applied AI · Bengaluru · 500+ professionals ]</div>
          <h1>
            Enterprise AI
            <br />
            from prompt
            <br />
            <span className="accent">to production.</span>
          </h1>
          <p className="lead">
            We design, build and deploy production AI — agents, copilots, generative AI and RAG
            systems — that run inside enterprise products across BFSI, healthcare, manufacturing
            and more.
          </p>
          <div className="herobtns">
            <Link className="btn primary" href="/contact">
              Bring us a problem →
            </Link>
            <Link className="btn" href="#products">
              See products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
