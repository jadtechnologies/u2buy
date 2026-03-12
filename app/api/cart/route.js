import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        // Lazy-sync user on GET request as well to ensure they exist in DB
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name';

        const dbUser = await prisma.user.upsert({
            where: { id: userId },
            update: {
                // Keep info updated
                email: user.emailAddresses[0].emailAddress,
                name: name,
                image: user.imageUrl,
            },
            create: {
                id: userId,
                email: user.emailAddresses[0].emailAddress,
                name: name,
                image: user.imageUrl,
                cart: {}
            },
            select: { cart: true }
        });

        return NextResponse.json({ success: true, cart: dbUser.cart || {}, isPlus: false });
    } catch (error) {
        console.error("CART GET ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const { cart } = await request.json();

        // Use upsert to create/update the user
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name';

        await prisma.user.upsert({
            where: { id: userId },
            update: { cart },
            create: {
                id: userId,
                email: user.emailAddresses[0].emailAddress,
                name: name,
                image: user.imageUrl,
                cart: cart
            }
        });

        return NextResponse.json({ success: true, message: "Cart updated successfully" });
    } catch (error) {
        console.error("CART POST ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
