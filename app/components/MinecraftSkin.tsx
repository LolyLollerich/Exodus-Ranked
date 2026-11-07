
"use client";

import { useEffect, useRef, useState } from "react";
import { SkinViewer, IdleAnimation } from "skinview3d";

type MinecraftSkinProps = {
  username: string;
  minecraftUuid?: string | null;
  width?: number;
  height?: number;
};

export default function MinecraftSkin({
  username,
  minecraftUuid,
  width = 320,
  height = 420,
}: MinecraftSkinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [skinError, setSkinError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    let cancelled = false;

    setSkinError(false);

    const viewer = new SkinViewer({
      canvas: canvasRef.current,
      width,
      height,
    });

    viewer.zoom = 0.8;
    viewer.fov = 50;
    viewer.animation = new IdleAnimation();
    viewer.controls.enableRotate = true;
    viewer.controls.enableZoom = false;
    viewer.controls.enablePan = false;

    async function loadMinecraftSkin() {
      try {
        let uuid = minecraftUuid;

        if (!uuid) {
          const uuidResponse = await fetch(
            `/api/minecraft/uuid?username=${encodeURIComponent(username)}`
          );

          if (!uuidResponse.ok) {
            throw new Error("Minecraft account not found");
          }

          const profile = await uuidResponse.json();
          uuid = profile.uuid;
        }

        if (cancelled || !uuid) return;

        const skinResponse = await fetch(
          `/api/minecraft/skin?uuid=${encodeURIComponent(uuid)}`
        );

        if (!skinResponse.ok) {
          throw new Error("Minecraft skin unavailable");
        }

        const skin = await skinResponse.json();

        if (cancelled) return;

        await viewer.loadSkin(skin.url, {
          model: skin.model,
        });
      } catch (error) {
        console.error("Minecraft skin loading failed:", error);

        if (!cancelled) {
          setSkinError(true);
        }
      }
    }

    loadMinecraftSkin();

    return () => {
      cancelled = true;
      viewer.dispose();
    };
  }, [username, minecraftUuid, width, height]);

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg border border-purple-400/30 bg-gradient-to-b from-[#28164a] to-[#100d1b]"
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="h-full w-full"
      />

      {skinError && (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-gray-400">
          Minecraft skin unavailable
        </div>
      )}
    </div>
  );
}
