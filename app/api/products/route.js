import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
    try {
        const products = await prisma.product.findMany({
            include: {
                rating: true,
                store: true,
            }
        });
        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
