import { INDUSTRIES } from "@/lib/data";
import FieldLayer from "@/components/shared/FieldLayer";

export default function Industries() {
  return (
    <section id="industries">
      <FieldLayer />
      <div className="sechead">
        <div>
          <div className="kicker">[ Industries ]</div>
          <h2>Sectors where our AI already runs in production.</h2>
        </div>
      </div>
      <div className="chips">
        {INDUSTRIES.map((i) => (
          <span key={i} className="mono chip">
            {i}
          </span>
        ))}
      </div>
    </section>
  );
}
