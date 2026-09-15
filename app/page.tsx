import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import StatBand from "@/components/home/StatBand";
import Services from "@/components/home/Services";
import Products from "@/components/home/Products";
import ProductModel from "@/components/home/ProductModel";
import Approach from "@/components/home/Approach";
import Industries from "@/components/home/Industries";
import Cta from "@/components/home/Cta";
import Footer from "@/components/layout/Footer";
import { pageMetadata } from "@/lib/seo";

/**
 * `absolute` because the layout's title template appends the brand, and the
 * homepage title already carries it — without this it would read
 * "… | UFTECH.AI | UFTECH.AI". The wording leads with what someone searches
 * for rather than with the strapline: nobody types "from prompt to production".
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Enterprise AI Development Company",
    description:
      "UFTECH.AI builds production AI for enterprises — custom AI agents, copilots, GenAI and RAG systems, intelligent automation, fraud and risk models, and MLOps. Bengaluru-based, ISO 9001:2015 certified, delivering since 2003.",
    path: "/",
  }),
  title: { absolute: "Enterprise AI Development Company | UFTECH.AI" },
};

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <StatBand />
      <Products />
      <ProductModel />
      <Services />
      <Approach />
      <Industries />
      <Cta />
      <Footer />
    </>
  );
}
