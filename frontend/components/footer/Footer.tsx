import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  // Generate bubbles array
  const bubbles = Array.from({ length: 128 }, (_, i) => ({
    size: 2 + Math.random() * 4,
    distance: 6 + Math.random() * 4,
    position: -5 + Math.random() * 110,
    time: 2 + Math.random() * 2,
    delay: -1 * (2 + Math.random() * 2),
  }));

  return (
    <div className="body">
      <div className="main"></div>
      <div className="footer">
        <div className="bubbles">
          {bubbles.map((bubble, i) => (
            <div
              key={i}
              className="bubble"
              style={
                {
                  "--size": `${bubble.size}rem`,
                  "--distance": `${bubble.distance}rem`,
                  "--position": `${bubble.position}%`,
                  "--time": `${bubble.time}s`,
                  "--delay": `${bubble.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div className="content bg-transparent">
          <div className="bg-[#5c6742]">te</div>
        </div>
      </div>
      <svg style={{ position: "fixed", top: "100vh" }}>
        <defs>
          <filter id="blob">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="blob"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default Footer;
