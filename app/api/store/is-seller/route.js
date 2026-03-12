import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";

// Auth Seller
export async function GET(request) {
    try {
        const { userId } = await auth();
        const isSeller = await authSeller(userId)

        const storeInfo = await prisma.store.findUnique({
            where: { userId }
        })

        if (!isSeller) {
            return NextResponse.json({
                isSeller: false,
                message: storeInfo ? `Your store is ${storeInfo.status}` : 'No store found'
            });
        }

        return NextResponse.json({ isSeller, storeInfo })
    } catch (error) {
        console.error("IS_SELLER ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}