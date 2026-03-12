import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { storeId, status } = await request.json();

        if (!await authAdmin()) {
            return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 });
        }

        await prisma.store.update({
            where: { id: storeId },
            data: { status }
        });

        return NextResponse.json({ success: true, message: "Store status updated" });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
