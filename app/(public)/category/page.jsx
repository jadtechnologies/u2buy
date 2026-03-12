'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { Shirt, Monitor, Lightbulb, Watch, Backpack, Leaf } from 'lucide-react';
import Image from 'next/image';
import womens_clothing from '@/assets/womens_clothing.png';
import mens_clothing from '@/assets/mens_clothing.png';

const categories = [
    { name: "Women's clothing", icon: <Image src={womens_clothing} alt="Women's clothing" width={50} height={50} className="object-contain drop-shadow-sm" />, color: "bg-pink-100/50" },
    { name: "Men's clothing", icon: <Image src={mens_clothing} alt="Men's clothing" width={80} height={80} className="object-contain drop-shadow-sm" />, color: "bg-blue-100/50" },
    { name: "Jewelry & watches", icon: <Watch size={40} className="text-yellow-500" />, color: "bg-yellow-100" },
    { name: "Sports & bags", icon: <Backpack size={40} className="text-green-500" />, color: "bg-green-100" },
    { name: "Electronics", icon: <Monitor size={40} className="text-purple-500" />, color: "bg-purple-100" },
    { name: "Home & garden", icon: <Leaf size={40} className="text-teal-500" />, color: "bg-teal-100" },
    { name: "Home Improvement & Lighting", icon: <Lightbulb size={40} className="text-orange-500" />, color: "bg-orange-100" },
];

export default function CategoryPage() {
    const router = useRouter();

    return (
        <div className="min-h-[70vh] mx-6 py-10">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-semibold text-slate-800 mb-8 text-center">Shop by Category</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((cat, index) => (
                        <div
                            key={index}
                            onClick={() => router.push(`/shop?category=${encodeURIComponent(cat.name)}`)}
                            className="cursor-pointer group flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                                {cat.icon}
                            </div>
                            <h2 className="text-center text-lg font-medium text-slate-700 group-hover:text-green-600 transition-colors">{cat.name}</h2>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
