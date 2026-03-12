import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Add new rating
export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const { orderId, productId, rating, review } = data;

        console.log("POST /api/rating request received:", { orderId, productId, rating, review, userId });

        if (!orderId || !productId || rating === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId,
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found or not belonging to user" }, { status: 404 });
        }

        const isAlreadyRated = await prisma.rating.findFirst({
            where: {
                productId,
                orderId,
                userId
            }
        });

        if (isAlreadyRated) {
            return NextResponse.json({ error: "Product already rated" }, { status: 400 });
        }

        const newRating = await prisma.rating.create({
            data: { userId, productId, rating: Number(rating), review, orderId }
        });

        return NextResponse.json({ message: "Rating added successfully", rating: newRating });
    } catch (error) {
        console.error("RATING_POST_ERROR:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}

// Get all ratings for a user
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
        }
        const ratings = await prisma.rating.findMany({
            where: {
                userId,
            }
        });
        return NextResponse.json({ ratings });
    } catch (error) {
        console.error("RATING_GET_ERROR:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
