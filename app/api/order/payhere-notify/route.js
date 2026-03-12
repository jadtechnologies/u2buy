import { NextResponse } from 'next/server';
import crypto from 'crypto';
// import prisma from '@/lib/prisma'; // Uncomment and use when you have order management implemented

export async function POST(req) {
    try {
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());

        const {
            merchant_id,
            order_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
        } = data;

        const merchantSecret = process.env.PAYHERE_SECRET?.trim();

        if (!merchantSecret) {
            return NextResponse.json({ error: "PayHere secret not configured" }, { status: 500 });
        }

        const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

        const localMd5Sig = crypto.createHash('md5')
            .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
            .digest('hex')
            .toUpperCase();

        if (localMd5Sig === md5sig && status_code === '2') {
            // Payment successful (Status 2: Success, 0: Pending, -1: Canceled, -2: Failed, -3: Chargedback)
            console.log(`✅ PayHere: Payment successful for order ${order_id}`);

            // TODO: Update your order status in the database
            // await prisma.order.update({
            //     where: { id: order_id },
            //     data: { isPaid: true }
            // });
        } else {
            console.log(`⚠️ PayHere: Payment status ${status_code} for order ${order_id}`);
        }

        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error("❌ PayHere Notify Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
