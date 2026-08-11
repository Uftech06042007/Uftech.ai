import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LeadershipCarousel from "@/components/about/LeadershipCarousel";
import { ABOUT_STATS, ABOUT_STRENGTHS } from "@/lib/data";

export const metadata: Metadata = {
  title: "About — UFTECH.AI",
  description:
    "Inspired innovations since 2003 — UFTECH.AI is the applied-AI division of Unitforce Technologies.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <section id="about-hero">
        <div className="kicker">[ About ]</div>
        <h1>Inspired Innovations since 2003.</h1>
      </section>

      <section id="about-story">
        <div className="sechead">
          <div>
            <div className="kicker">[ Our story ]</div>
            <h2>Applied AI, built on two decades of delivery.</h2>
            <p className="sub">
              Established in 2003, Unitforce Technologies provides software, engineering and
              talent-acquisition services globally, headquartered in Bengaluru with 400+ employees
              across India, the USA and the UAE. The company operates through five interconnected
              divisions — AI, engineering, talent, software and manufacturing — and is known for
              new product design and AI-powered analytics tools that support productivity, process
              improvement and data-driven decision-making. UFTECH.AI is its applied-AI division,
              ISO 9001:2015 certified.
            </p>
          </div>
        </div>
        <div className="statband blueprint">
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          {ABOUT_STATS.map((s) => (
            <div className="stat" key={s.l}>
              <div className="n">{s.n}</div>
              <div className="mono l">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="about-strengths">
        <div className="sechead">
          <div>
            <div className="kicker">[ Why teams work with us ]</div>
            <h2>Four things that don&apos;t change.</h2>
          </div>
        </div>
        <div className="infogrid">
          {ABOUT_STRENGTHS.map((s) => (
            <div key={s.k} className="blueprint infocard">
              <i className="corner tl" />
              <i className="corner tr" />
              <i className="corner bl" />
              <i className="corner br" />
              <div className="mono k">{s.k}</div>
              <h4>{s.t}</h4>
              <p>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about-leadership">
        <div className="sechead">
          <div>
            <div className="kicker">[ Leadership ]</div>
            <h2>The people who run it.</h2>
          </div>
        </div>
      </section>
      <LeadershipCarousel />

      <Footer />
    </>
  );
}
