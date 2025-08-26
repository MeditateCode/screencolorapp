import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* helper */
const randomHex = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

function blendWithWhite(hex, pct) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.round(r + (255 - r) * pct);
  const ng = Math.round(g + (255 - g) * pct);
  const nb = Math.round(b + (255 - b) * pct);
  return (
    "#" +
    nr.toString(16).padStart(2, "0") +
    ng.toString(16).padStart(2, "0") +
    nb.toString(16).padStart(2, "0")
  );
}

/* modes data */
const tabs = [
  { id: "solid", name: "Solid" },
  { id: "gradient", name: "Gradient" },
  { id: "classic", name: "Disco 1" },
  { id: "slowFade", name: "Disco 2" },
  { id: "pulse", name: "Disco 3" },
  { id: "rainbow", name: "Disco 4" },
  { id: "neon", name: "Disco 5" },
];

export default function ScreenColor() {
  // ui state
  const [active, setActive] = useState(tabs[0].id);
  const [color, setColor] = useState("#b83bff");
  const [bgStyle, setBgStyle] = useState(`#b83bff`);
  const [transitionDur, setTransitionDur] = useState("0.5s");
  const [message, setMessage] = useState("");

  // tabbar visibility
  const [tabbarVisible, setTabbarVisible] = useState(true);
  const hideTimerRef = useRef(null);

  const messageTimerRef = useRef(null);
  const intervalRef = useRef(null);
  const hueRef = useRef(0);
  const pulseToggleRef = useRef(false);
  const baseColorRef = useRef(color);

  // show a 3s message in center
  const showCenteredMessage = (txt) => {
    setMessage(txt);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setMessage(""), 3000);
  };

  const handleColorPick = (val) => {
    setColor(val);
    baseColorRef.current = val;
    setActive("solid");
    setBgStyle(val);
  };

  const clearCurrentInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // effect: mode controller
  useEffect(() => {
    clearCurrentInterval();
    baseColorRef.current = color;
    setTransitionDur("0.5s");

    if (active === "solid") {
      setBgStyle(color);
    } else if (active === "gradient") {
      const g1 = randomHex();
      const g2 = randomHex();
      setBgStyle(`linear-gradient(135deg, ${g1}, ${g2})`);
    } else if (active === "classic") {
      intervalRef.current = setInterval(() => {
        const h1 = randomHex();
        const h2 = randomHex();
        setBgStyle(`linear-gradient(45deg, ${h1}, ${h2})`);
      }, 500);
    } else if (active === "slowFade") {
      setTransitionDur("1.6s");
      intervalRef.current = setInterval(() => {
        const h = randomHex();
        const h2 = randomHex();
        setBgStyle(`linear-gradient(45deg, ${h}, ${h2})`);
      }, 2000);
    } else if (active === "pulse") {
      const bright = blendWithWhite(baseColorRef.current, 0.6);
      pulseToggleRef.current = false;
      intervalRef.current = setInterval(() => {
        pulseToggleRef.current = !pulseToggleRef.current;
        setBgStyle(pulseToggleRef.current ? bright : baseColorRef.current);
      }, 700);
    } else if (active === "rainbow") {
      hueRef.current = 0;
      intervalRef.current = setInterval(() => {
        hueRef.current = (hueRef.current + 8) % 360;
        setBgStyle(`hsl(${hueRef.current}, 100%, 50%)`);
      }, 100);
    } else if (active === "neon") {
      hueRef.current = 0;
      intervalRef.current = setInterval(() => {
        hueRef.current = (hueRef.current + 20) % 360;
        setBgStyle(
          `linear-gradient(90deg, hsl(${hueRef.current},100%,60%), hsl(${(hueRef.current + 90) % 360},100%,60%))`
        );
      }, 120);
    }

    return () => clearCurrentInterval();
  }, [active]);

  useEffect(() => {
    baseColorRef.current = color;
  }, [color]);

  const handleTabClick = (tab) => {
    setActive(tab.id);
    showCenteredMessage(`${tab.name} Activated`);
  };

  /* ------------------------
     TABBAR AUTO-HIDE LOGIC
  ------------------------- */
  const resetHideTimer = () => {
    setTabbarVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setTabbarVisible(false), 3000);
  };

  useEffect(() => {
    resetHideTimer();
    const handleActivity = () => resetHideTimer();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <div
      className="screen-root"
      style={{
        background: bgStyle,
        transition: `background-color ${transitionDur} linear, background ${transitionDur} linear`,
      }}
    >
      {/* centered message */}
      <div className="center-msg-area">
        <AnimatePresence>
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="center-msg"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* bottom tabbar */}
      <motion.div
        className="tabbar"
        initial={{ y: 80, opacity: 0 }}
        animate={tabbarVisible ? { y: 0, opacity: 1 } : { y: 80, opacity: 0 }}
        transition={{ duration: 0.4 }}
      >

        <div className="logo">
          <div className="logo-ball" />
          <div className="logo-text">
            Screen<span className="accent">Color</span>
          </div>
        </div>

        <div className="modes">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`mode-btn ${active === t.id ? "active" : ""}`}
              onClick={() => handleTabClick(t)}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="right-controls">
          <input
            className="color-picker"
            type="color"
            value={color}
            onChange={(e) => handleColorPick(e.target.value)}
            aria-label="Pick color"
          />
          <div className="hex-pill">
            {typeof bgStyle === "string" && bgStyle.startsWith("#")
              ? bgStyle.toUpperCase()
              : ""}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
