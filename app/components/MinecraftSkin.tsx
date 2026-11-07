
"use client";

import { useEffect, useRef } from "react";
import { SkinViewer, IdleAnimation } from "skinview3d";

type MinecraftSkinProps = {
  username: string;
  width?: number;
  height?: number;
};

export default function MinecraftSkin({
  username,
  width = 320,
  height = 420,
}: MinecraftSkinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewer = new SkinViewer({
      canvas: canvasRef.current,
      width,
      height,
      skin: `https://minotar.net/skin/${encodeURIComponent(username)}`,
    });

    viewer.zoom = 0.8;
    viewer.fov = 50;
    viewer.animation = new IdleAnimation();
    viewer.controls.enableRotate = true;
    viewer.controls.enableZoom = false;
    viewer.controls.enablePan = false;

    return () => {
      viewer.dispose();
    };
  }, [username, width, height]);

  return (
    <div
      className="shrink-0 overflow-hidden rounded-lg border border-purple-400/30 bg-gradient-to-b from-[#28164a] to-[#100d1b]"
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="h-full w-full"
      />
    </div>
  );
}
