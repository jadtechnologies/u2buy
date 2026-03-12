import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        if (!await authAdmin()) {
            return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 });
        }

        const stores = await prisma.store.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ success: true, stores });

    } catch (error) {
        console.error("API_ADMIN_STORES_ERROR:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Internal Server Error",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
