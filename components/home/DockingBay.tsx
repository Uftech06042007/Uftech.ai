"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS } from "@/lib/data";

const EJECT_X = 168;
const SPRING = { type: "spring" as const, stiffness: 260, damping: 24 };

function DockRail({
  index,
  inserted,
  onToggle,
}: {
  index: number;
  inserted: boolean;
  onToggle: () => void;
}) {
  const product = PRODUCTS[index];
  const [gen, setGen] = useState(0);
  const wasInserted = useRef(inserted);

  useEffect(() => {
    if (inserted && !wasInserted.current) setGen((g) => g + 1);
    wasInserted.current = inserted;
  }, [inserted]);

  return (
    <div className="dock-rail">
      <div className="dock-port">
        <i />
      </div>
      <div className="dock-track">
        <AnimatePresence>
          {inserted && (
            <motion.span
              key={gen}
              className="dock-pulse"
              initial={{ left: 0, opacity: 1 }}
              animate={{ left: "calc(100% - 6px)", opacity: [1, 1, 0] }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <div className="dock-cart-slot">
          <motion.div
            className={`dock-cart${inserted ? " inserted" : ""}`}
            animate={{ x: inserted ? 0 : EJECT_X }}
            transition={SPRING}
            onClick={onToggle}
          >
            <AnimatePresence>
              {inserted && (
                <motion.span
                  key={gen}
                  className="dock-spark"
                  initial={{ opacity: 1, scale: 0.3 }}
                  animate={{ opacity: 0, scale: 2.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                />
              )}
            </AnimatePresence>
            <i className="dock-pins" />
            <span className="dock-led" />
            <h5>{product.t}</h5>
            <em>{inserted ? "online" : "click to insert"}</em>
          </motion.div>
        </div>
      </div>

      <div className="dock-feats">
        {inserted &&
          product.chips.slice(0, 3).map((c) => (
            <div key={c} className="dock-feat">
              {c}
            </div>
          ))}
      </div>
    </div>
  );
}

export default function DockingBay() {
  const [inserted, setInserted] = useState<boolean[]>(() => PRODUCTS.map((p) => p.t === "AI HRMS"));

  const toggle = (i: number) => setInserted((prev) => prev.map((v, j) => (j === i ? !v : v)));
  const insertAll = () => setInserted(PRODUCTS.map(() => true));
  const ejectAll = () => setInserted(PRODUCTS.map(() => false));

  const onlineCount = inserted.filter(Boolean).length;

  return (
    <div>
      <div className="pp-stats">
        <div className="pp-stat">
          <label>Modules online</label>
          <b>
            {onlineCount}
            <em> / {PRODUCTS.length}</em>
          </b>
        </div>
        <button className="mono pp-reset" onClick={insertAll}>
          Insert all
        </button>
        <button className="mono pp-reset" onClick={ejectAll}>
          Eject all
        </button>
      </div>

      <div className="dock-wrap">
        <div className="dock-mainframe">
          <i className="dock-vents" />
          <span>Your system</span>
          <b>Owner-controlled base</b>
          <em>your infra · your database</em>
          <div className="dock-mstatus">
            <i className={onlineCount > 0 ? "on" : ""} />
            <i className={onlineCount > 1 ? "on" : ""} />
            <i className={onlineCount > 2 ? "on" : ""} />
          </div>
        </div>
        <div className="dock-rails">
          {PRODUCTS.map((p, i) => (
            <DockRail key={p.t} index={i} inserted={inserted[i]} onToggle={() => toggle(i)} />
          ))}
        </div>
      </div>
    </div>
  );
}
