import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact — UFTECH.AI",
  description:
    "Tell us what you're trying to build. A senior partner from the relevant practice replies within one business day.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <section id="contact">
        <div className="sechead">
          <div>
            <div className="kicker">[ Contact ]</div>
            <h2>Tell us what you&apos;re trying to build.</h2>
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
