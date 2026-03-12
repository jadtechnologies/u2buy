'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { dummyStoreData } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"

const StoreLayout = ({ children }) => {

    const { getToken } = useAuth()
    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)
    const [message, setMessage] = useState('')

    const fetchIsSeller = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/is-seller', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setIsSeller(data.isSeller)
            setStoreInfo(data.storeInfo)
            setMessage(data.message)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIsSeller()
    }, [])

    return loading ? (
        <Loading />
    ) : isSeller ? (
        <div className="flex flex-col h-screen">
            <SellerNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar storeInfo={storeInfo} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <p className="text-sm text-slate-400 mb-2 font-light">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">{message || "You are not authorized to access this page"}</h1>
            <div className="flex gap-4 mt-8">
                <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full">
                    Go to home <ArrowRightIcon size={18} />
                </Link>
                {message === "No store found" && (
                    <Link href="/create-store" className="border border-slate-300 text-slate-600 p-2 px-6 max-sm:text-sm rounded-full hover:bg-slate-50">
                        Create Store
                    </Link>
                )}
            </div>
        </div>
    )
}

export default StoreLayout