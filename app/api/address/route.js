import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, addresses });
    } catch (error) {
        console.error("ADDRESS GET ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const addressData = await request.json();

        const address = await prisma.address.create({
            data: {
                ...addressData,
                userId
            }
        });

        return NextResponse.json({ success: true, message: "Address added successfully", address });
    } catch (error) {
        console.error("ADDRESS POST ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
