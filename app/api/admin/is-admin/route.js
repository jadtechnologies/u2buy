import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ isAdmin: false }, { status: 401 });
        }

        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim();
        const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase().trim();

        const isAdmin = userEmail === adminEmail;

        return NextResponse.json({ isAdmin });
    } catch (error) {
        console.error("IS_ADMIN ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
