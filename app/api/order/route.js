import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { addressId, paymentMethod, items, couponCode } = await req.json();

        if (!addressId || !paymentMethod || !items || items.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Group items by storeId
        const stores = {};
        for (const item of items) {
            if (!stores[item.storeId]) {
                stores[item.storeId] = [];
            }
            stores[item.storeId].push(item);
        }

        // Handle Coupon if provided
        let couponData = {};
        let discountPercent = 0;
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() }
            });

            if (coupon && new Date(coupon.expiresAt) > new Date()) {
                couponData = {
                    code: coupon.code,
                    discount: coupon.discount,
                    description: coupon.description
                };
                discountPercent = coupon.discount;
            }
        }

        const orders = [];

        // Create an order for each store
        for (const [storeId, storeItems] of Object.entries(stores)) {
            let storeSubtotal = 0;
            const orderItemsData = storeItems.map(item => {
                storeSubtotal += item.price * item.quantity;
                return {
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                };
            });

            // Calculate final total (including discount)
            const discountAmount = (discountPercent / 100) * storeSubtotal;
            const finalTotal = storeSubtotal - discountAmount;

            const order = await prisma.order.create({
                data: {
                    userId,
                    storeId,
                    addressId,
                    total: finalTotal,
                    paymentMethod,
                    isPaid: false,
                    isCouponUsed: discountPercent > 0,
                    coupon: couponData,
                    orderItems: {
                        create: orderItemsData
                    }
                }
            });
            orders.push(order);
        }


        // Clear user's cart in DB
        await prisma.user.update({
            where: { id: userId },
            data: { cart: {} }
        });

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error("ORDER CREATION ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                },
                store: true,
                address: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error("ORDER FETCH ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}