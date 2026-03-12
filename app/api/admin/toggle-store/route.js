import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { storeId } = await request.json();

        if (!await authAdmin()) {
            return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 });
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });

        await prisma.store.update({
            where: { id: storeId },
            data: { isActive: !store.isActive }
        });

        return NextResponse.json({ success: true, message: "Store u" });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
