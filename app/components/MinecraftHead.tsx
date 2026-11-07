
"use client";

import { useEffect, useState } from "react";

type MinecraftHeadProps = {
  username: string;
  minecraftUuid?: string | null;
};

export default function MinecraftHead({
  username,
  minecraftUuid,
}: MinecraftHeadProps) {
  const [textureUrl, setTextureUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHead() {
      try {
        let uuid = minecraftUuid;

        if (!uuid) {
          const uuidResponse = await fetch(
            `/api/minecraft/uuid?username=${encodeURIComponent(username)}`
          );

          if (!uuidResponse.ok) {
            throw new Error("Minecraft UUID unavailable");
          }

          const profile = await uuidResponse.json();
          uuid = profile.uuid;
        }

        if (!uuid || cancelled) return;

        const skinResponse = await fetch(
          `/api/minecraft/skin?uuid=${encodeURIComponent(uuid)}`
        );

        if (!skinResponse.ok) {
          throw new Error("Minecraft skin unavailable");
        }

        const skin = await skinResponse.json();

        if (!cancelled) {
          setTextureUrl(skin.url);
        }
      } catch (error) {
        console.error(`Could not load head for ${username}:`, error);
      }
    }

    loadHead();

    return () => {
      cancelled = true;
    };
  }, [username, minecraftUuid]);

  return (
    <div
      className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-purple-500/10"
      style={
        textureUrl
          ? {
              backgroundImage: `url("${textureUrl}"), url("${textureUrl}")`,
              backgroundSize: "800% 800%, 800% 800%",
              backgroundPosition: "71.4286% 14.2857%, 14.2857% 14.2857%",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    />
  );
}
