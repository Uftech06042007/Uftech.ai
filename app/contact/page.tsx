import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact UFTECH.AI — Talk to an AI Engineering Partner",
  description:
    "Tell us what you're trying to build. A senior partner from the relevant practice replies within one business day. Bengaluru, India — info@uftech.com, +91 8951 390 893.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Header />
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />
      {/* The page had no h1 at all — its only heading was the h2 below, which
          left the document with no top-level subject for either a crawler or a
          screen reader's heading list. */}
      <section id="contact">
        <div className="sechead">
          <div>
            <div className="kicker">[ Contact ]</div>
            <h1>Tell us what you&apos;re trying to build.</h1>
            <p className="sub">
              A senior partner from the relevant practice will reply within one business day. No
              SDRs, no qualification calls — just the person who&apos;d actually run the work.
            </p>
          </div>
        </div>

        <div className="blueprint contactwrap">
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <ContactForm />
          <div className="contact-direct">
            <div className="mono flabel">Direct</div>
            <a href="mailto:info@uftech.com">info@uftech.com</a>
            <a href="tel:+918951390893">+91 8951 390 893</a>
            <a href="tel:+918951003881">+91 8951 003 881</a>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
