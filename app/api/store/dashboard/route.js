import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import authSeller from "@/middlewares/authSeller";
import prisma from "@/lib/prisma";

export async function GET(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        // Get all orders for seller
        const orders = await prisma.order.findMany({
            where: { storeId },
        });

        // Get all products for seller
        const products = await prisma.product.findMany({
            where: { storeId },
        });

        const productIds = products.map((product) => product.id);

        // Get ratings for these products
        const ratings = productIds.length > 0
            ? await prisma.rating.findMany({
                where: {
                    productId: { in: productIds },
                },
                include: {
                    user: true,
                    product: true,
                },
                orderBy: { createdAt: "desc" },
            })
            : [];

        const totalEarnings = orders.reduce((acc, order) => acc + (order.total || 0), 0);

        const dashboardData = {
            ratings: ratings || [],
            totalOrders: orders.length,
            totalEarnings: Math.round(totalEarnings),
            totalProducts: products.length,
        };

        return NextResponse.json({ dashboardData });
    } catch (error) {
        console.error("DASHBOARD_ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}