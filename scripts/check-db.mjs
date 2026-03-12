import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

async function main() {
    const stores = await prisma.store.findMany({
        select: { id: true, name: true, userId: true, status: true }
    });

    const orders = await prisma.order.findMany({
        select: { id: true, storeId: true, total: true, status: true, userId: true }
    });

    const products = await prisma.product.findMany({
        select: { id: true, storeId: true, name: true }
    });

    let output = '';
    output += '=== STORES ===\n';
    output += JSON.stringify(stores, null, 2) + '\n';
    output += '\n=== ORDERS ===\n';
    output += JSON.stringify(orders, null, 2) + '\n';
    output += '\n=== PRODUCTS ===\n';
    output += JSON.stringify(products, null, 2) + '\n';

    for (const store of stores) {
        const storeOrders = orders.filter(o => o.storeId === store.id);
        const storeProducts = products.filter(p => p.storeId === store.id);
        output += `\n=== Store: ${store.name} (ID: ${store.id}) ===\n`;
        output += `  UserId: ${store.userId}\n`;
        output += `  Status: ${store.status}\n`;
        output += `  Products: ${storeProducts.length}\n`;
        output += `  Orders: ${storeOrders.length}\n`;
        output += `  Total Earnings: ${storeOrders.reduce((acc, o) => acc + (o.total || 0), 0)}\n`;
    }

    writeFileSync('scripts/db-output.txt', output);
    console.log('Output written to scripts/db-output.txt');
}

main().catch(console.error).finally(() => prisma.$disconnect());
