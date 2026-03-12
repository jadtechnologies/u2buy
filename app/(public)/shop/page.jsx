'use client'
import { Suspense } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

function ShopContent() {

    // get query params ?search=abc or ?category=xyz
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    const filteredProducts = products.filter(product => {
        let matchesSearch = true;
        let matchesCategory = true;

        if (search) {
            matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        }

        if (category) {
            matchesCategory = product.category?.toLowerCase() === category.toLowerCase();
        }

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-[70vh] mx-6">
            <div className=" max-w-7xl mx-auto">
                <h1 onClick={() => router.push('/category')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> {(search || category) && <MoveLeftIcon size={20} />}  {category || "All"} <span className="text-slate-700 font-medium">Products</span></h1>
                <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                    {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </div>
        </div>
    )
}


export default function Shop() {
    return (
        <Suspense fallback={<div>Loading shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}