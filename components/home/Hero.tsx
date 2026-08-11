"use client";

import { useState } from "react";
import CardVideo from "@/components/shared/CardVideo";

// Candidate hero demo clips, kept side by side behind a toggle so we
// can compare them in place before committing to one as the section's
// full-bleed background.
const HERO_DEMOS = [
  "/videos/hero-demo1.mp4",
  "/videos/hero-demo4.mp4",
  "/videos/hero-demo5.mp4",
  "/videos/hero-demo6.mp4",
  "/videos/hero-demo7.mp4",
  "/videos/hero-demo8.mp4",
  "/videos/hero-demo9.mp4",
];

export default function Hero() {
  const [demo, setDemo] = useState(0);

  return (
    <section className="hero" id="top">
      <div className="herobg">
        <CardVideo key={demo} src={HERO_DEMOS[demo]} />
        <div className="herobgshade" />
      </div>

      <div className="heroctrls">
        <div className="herodemobtn">
          <span>Demo</span>
          {HERO_DEMOS.map((src, i) => (
            <button
              key={i}
              className={`btn sm toggle${demo === i ? " active" : ""}`}
              onClick={() => setDemo(i)}
            >
              {src.match(/hero-demo(\d+)/)?.[1]}
            </button>
          ))}
        </div>
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
            We design, build and deploy production AI — agents, copilots, generative and RAG
            systems — that run inside enterprise products across BFSI, healthcare, manufacturing
            and more.
          </p>
          <div className="herobtns">
            <a className="btn primary" href="/contact">
              Bring us a problem →
            </a>
            <a className="btn" href="#products">
              See products
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
