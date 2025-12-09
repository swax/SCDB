"use client";

import { useEffect, useState } from "react";

export default function Snow() {
  const [mounted, setMounted] = useState(false);
  const [snowflakes, setSnowflakes] = useState<
    Array<{ id: number; left: number; animationDuration: number; size: number }>
  >([]);

  useEffect(() => {
    setMounted(true);
    // Generate snowflakes
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 10 + Math.random() * 20,
      size: 10 + Math.random() * 15,
    }));
    setSnowflakes(flakes);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          style={{
            position: "absolute",
            top: "-20px",
            left: `${flake.left}%`,
            fontSize: `${flake.size}px`,
            color: "rgba(255, 255, 255, 0.8)",
            animation: `fall ${flake.animationDuration}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            userSelect: "none",
          }}
        >
          ❄
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) translateX(20px) rotate(90deg);
          }
          50% {
            transform: translateY(50vh) translateX(-15px) rotate(180deg);
          }
          75% {
            transform: translateY(75vh) translateX(25px) rotate(270deg);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(0px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
