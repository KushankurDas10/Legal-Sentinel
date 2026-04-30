"use client";

import React, { useEffect, useRef } from "react";

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const points: Point[] = [];
    const numPoints = 100;
    const maxDist = 300;
    const mouse = { x: width / 2, y: height / 2, active: false };
    const legalTerms = ["LIABILITY", "BREACH", "IP", "CLAUSE", "RISK", "SAFE", "SENTINEL", "CONTRACT"];

    class Point {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      term: string | null;

      constructor() {
        this.reset();
        this.term = Math.random() > 0.9 ? legalTerms[Math.floor(Math.random() * legalTerms.length)] : null;
      }

      reset() {
        this.x = (Math.random() - 0.5) * width * 2;
        this.y = (Math.random() - 0.5) * height * 2;
        this.z = Math.random() * 1000;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.vz = -0.5 - Math.random() * 0.5;
      }

      update() {
        this.z += this.vz;
        this.x += this.vx;
        this.y += this.vy;

        if (this.z < 0) this.z = 1000;
        
        const scale = 500 / (500 + this.z);
        const tiltX = mouse.active ? (mouse.x - width / 2) * 0.15 : 0;
        const tiltY = mouse.active ? (mouse.y - height / 2) * 0.15 : 0;

        const px = (this.x + tiltX) * scale + width / 2;
        const py = (this.y + tiltY) * scale + height / 2;

        return { px, py, scale };
      }
    }

    for (let i = 0; i < numPoints; i++) {
      points.push(new Point());
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Draw 3D Grid Floor
      const gridZ = 500;
      const gridScale = 500 / (500 + gridZ);
      ctx.strokeStyle = "rgba(255, 76, 76, 0.05)";
      ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i++) {
        const x = width / 2 + i * 200 * gridScale;
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(width / 2 + i * 800, height * 0.6);
        ctx.stroke();
      }

      points.sort((a, b) => b.z - a.z);

      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const { px: x1, py: y1, scale: s1 } = p1.update();

        // Draw Glow
        const gradient = ctx.createRadialGradient(x1, y1, 0, x1, y1, 10 * s1);
        gradient.addColorStop(0, `rgba(255, 76, 76, ${0.8 * s1})`);
        gradient.addColorStop(1, "rgba(255, 76, 76, 0)");
        
        ctx.beginPath();
        ctx.arc(x1, y1, 10 * s1, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw Legal Terms
        if (p1.term) {
          ctx.font = `${Math.floor(12 * s1)}px Outfit`;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * s1})`;
          ctx.fillText(p1.term, x1 + 10 * s1, y1);
        }

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const scale2 = 500 / (500 + p2.z);
          const x2 = (p2.x + (mouse.active ? (mouse.x - width / 2) * 0.15 : 0)) * scale2 + width / 2;
          const y2 = (p2.y + (mouse.active ? (mouse.y - height / 2) * 0.15 : 0)) * scale2 + height / 2;

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist * s1) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 76, 76, ${0.4 * (1 - dist / (maxDist * s1)) * s1})`;
            ctx.lineWidth = 1.5 * s1;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 bg-[#0A0A0A]"
    />
  );
}
