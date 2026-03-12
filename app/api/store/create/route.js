import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import imagekit from "@/lib/imagekit";

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const name = formData.get("name");
    const username = formData.get("username")?.toLowerCase();
    const description = formData.get("description");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const image = formData.get("image");

    if (!name || !username || !image) {
      return NextResponse.json(
        { error: "Name, username and image are required" },
        { status: 400 }
      );
    }

    // Check for existing store or username
    const existingStore = await prisma.store.findFirst({
      where: {
        OR: [{ userId }, { username }],
      },
    });

    if (existingStore) {
      if (existingStore.userId === userId) {
        return NextResponse.json(
          { error: "You already have a store." },
          { status: 400 }
        );
      }
      if (existingStore.username === username) {
        return NextResponse.json(
          { error: "Username is already taken. Please choose another one." },
          { status: 400 }
        );
      }
    }

    // Convert image to buffer
    const buffer = Buffer.from(await image.arrayBuffer());

    // Upload to ImageKit
    const upload = await imagekit.upload({
      file: buffer,
      fileName: `${username}-logo.jpg`,
      folder: "/stores",
    });

    // Save to database
    const store = await prisma.store.create({
      data: {
        userId,
        name,
        username,
        description,
        email,
        contact,
        address,
        logo: upload.url,
        status: "pending",
      },
    });

    return NextResponse.json({
      message: "Store submitted successfully. Await admin approval.",
      store,
    });
  } catch (error) {
    console.error("STORE_CREATE ERROR:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      const target = error.meta?.target || "";
      if (target.includes("username")) {
        return NextResponse.json(
          { error: "Username is already taken." },
          { status: 400 }
        );
      }
      if (target.includes("userId")) {
        return NextResponse.json(
          { error: "You already have a store." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (!store) {
      return NextResponse.json({ status: "not_found" });
    }

    return NextResponse.json({ status: store.status });
  } catch (error) {
    console.error("STORE_FETCH ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
