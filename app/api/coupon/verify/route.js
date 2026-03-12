import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
    try {
        const { userId } = await auth();
        const { code } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: {
                code: code.toUpperCase(),
                expiresAt: {
                    gt: new Date()
                }
            }
        });

        if (!coupon) {
            return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });
        }

        // Check for new user restriction
        if (coupon.forNewUser) {
            const userOrders = await prisma.order.findMany({
                where: { userId }
            });
            if (userOrders.length > 0) {
                return NextResponse.json({ error: "This coupon is valid for new users only" }, { status: 400 });
            }
        }

        // Check for Plus member restriction
        if (coupon.forMember) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { isPlus: true }
            });

            if (!user?.isPlus) {
                return NextResponse.json({ error: "This coupon is valid for GoCart Plus members only" }, { status: 400 });
            }
        }

        return NextResponse.json({ coupon });
    } catch (error) {
        console.error("COUPON VERIFY ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
