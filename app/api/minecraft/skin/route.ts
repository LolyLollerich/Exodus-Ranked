
import { NextResponse } from "next/server";



export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get("uuid")?.replace(/-/g, "");

  if (!uuid || !/^[0-9a-f]{32}$/i.test(uuid)) {
    return NextResponse.json(
      { error: "Invalid Minecraft UUID." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Minecraft profile unavailable." },
        { status: 404 }
      );
    }

    const profile = await response.json();

    const textureProperty = profile.properties?.find(
      (property: { name: string; value: string }) =>
        property.name === "textures"
    );

    if (!textureProperty) {
      return NextResponse.json(
        { error: "No Minecraft skin found." },
        { status: 404 }
      );
    }

    const textureData = JSON.parse(
      Buffer.from(textureProperty.value, "base64").toString("utf8")
    );

    const skin = textureData.textures?.SKIN;

    if (!skin?.url) {
      return NextResponse.json(
        { error: "No skin texture found." },
        { status: 404 }
      );
    }

    const skinUrl = new URL(skin.url);

    if (skinUrl.hostname !== "textures.minecraft.net") {
      return NextResponse.json(
        { error: "Invalid skin texture URL." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      url: skinUrl.href.replace(/^http:/, "https:"),
      model: skin.metadata?.model === "slim" ? "slim" : "default",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load Minecraft skin." },
      { status: 500 }
    );
  }
}
