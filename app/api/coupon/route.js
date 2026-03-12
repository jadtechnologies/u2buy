import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";

// Add new coupon
export async function POST(request) {
    try {
        const isAdmin = await authAdmin();

        if (!isAdmin) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        const { coupon } = await request.json();

        // Ensure code is uppercase
        if (coupon.code) {
            coupon.code = coupon.code.toUpperCase();
        }

        await prisma.coupon.create({ data: coupon });

        return NextResponse.json({ message: "Coupon added successfully" });
    } catch (error) {
        console.error("ADD COUPON ERROR:", error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}

// Delete coupon /api/coupon?code=COUPONCODE
export async function DELETE(request) {
    try {
        const isAdmin = await authAdmin();

        if (!isAdmin) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        const { searchParams } = request.nextUrl;
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
        }

        await prisma.coupon.delete({ where: { code } });
        return NextResponse.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error("DELETE COUPON ERROR:", error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}

// Get all coupons
export async function GET(request) {
    try {
        const isAdmin = await authAdmin();

        if (!isAdmin) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ coupons });
    } catch (error) {
        console.error("GET COUPONS ERROR:", error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}