import FieldLayer from "@/components/shared/FieldLayer";
import DockingBay from "./DockingBay";

export default function ProductModel() {
  return (
    <section id="product-model">
      <FieldLayer />
      <div className="sechead">
        <div>
          <div className="kicker">[ How it works ]</div>
          <h2>Not a subscription. Yours.</h2>
        </div>
      </div>

      <DockingBay />
    </section>
  );
}
