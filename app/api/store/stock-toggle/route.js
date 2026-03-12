import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";

export async function POST(request) {
    try {
        const { userId } = await auth();
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: "Missing details: productId" }, { status: 400 });
        }

        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const product = await prisma.product.findFirst({
            where: { id: productId, storeId },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        await prisma.product.update({
            where: { id: productId },
            data: { inStock: !product.inStock },
        });

        return NextResponse.json({ message: "Product stock updated successfully" });
    } catch (error) {
        console.error("STOCK_TOGGLE ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}