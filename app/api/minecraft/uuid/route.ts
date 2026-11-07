import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (
    !username ||
    username.length < 3 ||
    username.length > 16 ||
    !/^[a-zA-Z0-9_]+$/.test(username)
  ) {
    return NextResponse.json(
      { error: "Invalid Minecraft username." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`,
      { cache: "no-store" }
    );

    if (response.status === 204 || response.status === 404) {
      return NextResponse.json(
        { error: "Minecraft account not found." },
        { status: 404 }
      );
    }

    if (response.status === 429) {
      return NextResponse.json(
        { error: "Minecraft API rate limit reached. Try again later." },
        { status: 429 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Could not verify Minecraft account." },
        { status: 502 }
      );
    }

    const profile = await response.json();

    return NextResponse.json({
      username: profile.name,
      uuid: profile.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Minecraft API is currently unavailable." },
      { status: 503 }
    );
  }
}