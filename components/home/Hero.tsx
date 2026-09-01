import Link from "next/link";
import CardVideo from "@/components/shared/CardVideo";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="herobg">
        <CardVideo src="/videos/hero-demo1.mp4" />
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
