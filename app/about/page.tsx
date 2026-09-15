import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { ABOUT_STATS, ABOUT_STRENGTHS } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

/* The brand is appended by the layout's title template — see app/layout.tsx. */
export const metadata: Metadata = pageMetadata({
  title: "About UFTECH.AI — Applied AI since 2003",
  description:
    "UFTECH.AI is the applied-AI division of Unitforce Technologies: 400+ employees across India, the USA and the UAE, ISO 9001:2015 certified, delivering software and AI since 2003.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Header />
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />
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
            <h2>Run by the people who built it.</h2>
          </div>
        </div>
        <div className="leadboast">
          <p>
            Our management is not a layer above the work — it is the group that created it.
            The President built Unitforce across <b>29 years</b> in product development,
            engineering services and applied AI. The CEO has led global delivery for more than
            <b>two decades</b>, took the AI practice from first pilots into production, and
            served on NASSCOM&apos;s National SME Council.
          </p>
          <p>
            Beneath them every function is owned outright — delivery, talent, finance,
            AI engineering — each by a leader with <b>12 to 19 years</b> in that discipline,
            not a generalist covering four. That bench is why a <b>400-person</b> company spanning
            India, the USA and the UAE ships AI to ISO 9001:2015 discipline, and why the
            person who scopes your project is the one accountable for it.
          </p>
          <a
            className="btn accent"
            href="https://uftech.com/about"
            target="_blank"
            rel="noopener noreferrer"
          >
            See our management &#8599;
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
