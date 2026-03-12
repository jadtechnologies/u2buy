import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        if (!await authAdmin()) {
            return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 });
        }

        const ordersCount = await prisma.order.count();
        const storesCount = await prisma.store.count();
        const productsCount = await prisma.product.count();

        const orders = await prisma.order.findMany({
            select: {
                total: true,
                createdAt: true,
            }
        });

        const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

        return NextResponse.json({
            success: true,
            dashboardData: {
                orders: ordersCount,
                stores: storesCount,
                products: productsCount,
                revenue: totalRevenue.toFixed(2),
                allOrders: orders
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
