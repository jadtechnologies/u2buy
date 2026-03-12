'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function OrdersAreaChart({ allOrders }) {

    // Group orders by date
    const ordersPerDay = allOrders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0] // format: YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1
        return acc
    }, {})

    // Convert to array for Recharts
    const chartData = Object.entries(ordersPerDay).map(([date, count]) => ({
        date,
        orders: count
    }))

    return (
        <div className="w-full">
            <div className="flex justify-end mb-3">
                <h3 className="text-sm font-normal text-slate-400">Orders / Day</h3>
            </div>
            <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#d1d5db" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f3f4f6" strokeWidth={1} />
                        <XAxis
                            dataKey="date"
                            stroke="#e5e7eb"
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                            dy={10}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                        />
                        <YAxis
                            allowDecimals={false}
                            stroke="#e5e7eb"
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            orientation="left"
                            label={{ value: 'Orders', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                fontSize: '12px',
                                padding: '8px 12px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="orders"
                            stroke="#9ca3af"
                            fillOpacity={1}
                            fill="url(#colorOrders)"
                            strokeWidth={1.5}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
