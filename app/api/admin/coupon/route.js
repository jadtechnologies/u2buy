// import authAdmin from "@/middlewares/authAdmin";
// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";

// // Add new coupon
// export async function POST(request) {
//     try {
//         if (!await authAdmin()) {
//             return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 });
//         }

//         const { coupon } = await request.json();
//         const { code, description, discount, forNewUser, forMember, isPublic, expiresAt } = coupon;

//         if (!code || !description || !discount || !expiresAt) {
//             return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
//         }

//         const newCoupon = await prisma.coupon.create({
//             data: {
//                 code,
//                 description,
//                 discount: parseFloat(discount),
//                 forNewUser: Boolean(forNewUser),
//                 forMember: Boolean(forMember),
//                 isPublic: Boolean(isPublic),
//                 expiresAt: new Date(expiresAt)
//             }
//         });

//         return NextResponse.json({ success: true, message: "Coupon added", coupon: newCoupon });

//     } catch (error) {
//         return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//     }
// }

// export async function GET(request) {
//     try {
//         const coupons = await prisma.coupon.findMany({
//             orderBy: { createdAt: 'desc' }
//         });

//         return NextResponse.json({ success: true, coupons });

//     } catch (error) {
//         return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//     }
// }

// export async function DELETE(request) {
//     try {
//         if (!await authAdmin()) {
//             return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 });
//         }

//         const { searchParams } = new URL(request.url);
//         const code = searchParams.get('code');

//         if (!code) {
//             return NextResponse.json({ success: false, message: "Missing coupon code" }, { status: 400 });
//         }

//         await prisma.coupon.delete({
//             where: { code }
//         });

//         return NextResponse.json({ success: true, message: "Coupon deleted" });

//     } catch (error) {
//         return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//     }
// }

import authAdmin from "@/middlewares/authAdmin"
import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { inngest } from "@/inngest/client"

// Add new coupon
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })
        }

        const { coupon } = await request.json()

        if (!coupon || !coupon.code) {
            return NextResponse.json({ success: false, message: "Coupon code is required" }, { status: 400 })
        }

        coupon.code = coupon.code.toUpperCase()

        const newCoupon = await prisma.coupon.create({
            data: coupon
        })

        // Run Inngest Scheduler Function to delete coupon on expire
        await inngest.send({
            name: "app/coupon.expired",
            data: {
                code: newCoupon.code,
                expires_at: newCoupon.expiresAt,
            }
        })

        return NextResponse.json({ success: true, message: "Coupon added successfully", coupon: newCoupon })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, message: error.code || error.message }, { status: 400 })
    }
}

// Delete coupon /api/coupon?code=couponCode
export async function DELETE(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code')

        if (!code) {
            return NextResponse.json({ success: false, message: "Missing coupon code" }, { status: 400 })
        }

        await prisma.coupon.delete({
            where: { code }
        })

        return NextResponse.json({ success: true, message: "Coupon deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, message: error.code || error.message }, { status: 400 })
    }
}

// Get all coupons
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ success: true, coupons })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, message: error.code || error.message }, { status: 400 })
    }
}