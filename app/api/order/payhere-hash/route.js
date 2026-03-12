import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const { orderId, amount, currency } = await req.json();

        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_SECRET;

        if (!merchantId || !merchantSecret) {
            return NextResponse.json({ error: "PayHere credentials not configured" }, { status: 500 });
        }

        const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
        const amountFormatted = parseFloat(amount).toFixed(2);

        const hash = crypto.createHash('md5')
            .update(merchantId + orderId + amountFormatted + currency + hashedSecret)
            .digest('hex')
            .toUpperCase();

        return NextResponse.json({ hash, merchant_id: merchantId });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
