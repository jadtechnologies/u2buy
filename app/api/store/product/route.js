import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import imagekit from "@/lib/imagekit";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";

export async function POST(request) {
  try {
    const { userId } = await auth();
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const mrp = Number(formData.get("mrp"));
    const price = Number(formData.get("price"));
    const category = formData.get("category");
    const images = formData.getAll("images"); // Use getAll for multiple files

    if (!name || !description || isNaN(mrp) || isNaN(price) || !category || images.length === 0) {
      return NextResponse.json({ error: "Invalid product details" }, { status: 400 });
    }

    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });
        return response.url;
      })
    );

    await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: imagesUrl,
        storeId,
      },
    });

    return NextResponse.json({ message: "Product added successfully" });
  } catch (error) {
    console.error("PRODUCT CREATE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { userId } = await auth();
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { storeId },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("PRODUCT GET ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
