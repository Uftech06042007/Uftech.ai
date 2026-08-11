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
