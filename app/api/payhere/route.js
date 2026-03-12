import { NextResponse } from "next/server"
import crypto from "crypto"
import prisma from "@/lib/prisma"

export async function POST(request) {
    try {
        const formData = await request.formData()
        const data = Object.fromEntries(formData.entries())

        const {
            merchant_id,
            order_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig
        } = data

        const merchantSecret = process.env.PAYHERE_SECRET?.trim()

        if (!merchantSecret) {
            return NextResponse.json({ error: "PayHere secret not configured" }, { status: 500 })
        }

        const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()

        const localMd5Sig = crypto.createHash('md5')
            .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
            .digest('hex')
            .toUpperCase()

        if (localMd5Sig === md5sig) {
            if (status_code === '2') {
                // Payment successful
                const order = await prisma.order.update({
                    where: { id: order_id },
                    data: { isPaid: true }
                })

                if (order?.userId) {
                    await prisma.user.update({
                        where: { id: order.userId },
                        data: { cart: {} }
                    })
                }
            } else if (status_code === '-1' || status_code === '-2') {
                // Payment canceled or failed, delete order from db
                await prisma.order.delete({
                    where: { id: order_id }
                })
            }
        } else {
            console.error("PayHere Signature mismatch")
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
        }

        return new Response('OK', { status: 200 })
    } catch (error) {
        console.error("PayHere Webhook Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
