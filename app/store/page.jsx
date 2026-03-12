'use client'
import Loading from "@/components/Loading"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"
import { format } from "date-fns"

export default function Dashboard() {

    const { getToken } = useAuth()

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'LKR'

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
        { title: 'Total Earnings', value: currency + dashboardData.totalEarnings, icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon },
        { title: 'Total Ratings', value: dashboardData.ratings.length, icon: StarIcon },
    ]

    const fetchDashboardData = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/dashboard', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (data?.dashboardData) {
                setDashboardData({
                    totalProducts: data.dashboardData.totalProducts || 0,
                    totalEarnings: data.dashboardData.totalEarnings || 0,
                    totalOrders: data.dashboardData.totalOrders || 0,
                    ratings: data.dashboardData.ratings || [],
                })
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error)
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    const [time, setTime] = useState(new Date())

    useEffect(() => {
        fetchDashboardData()
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>
                <div className="flex items-center gap-2 text-sm text-slate-400 font-light">
                    <p>{format(time, 'EEEE, dd MMMM yyyy')}</p>
                    <span>•</span>
                    <p className="font-medium text-slate-500">{format(time, 'hh:mm:ss a')}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg bg-white hover:shadow-md transition-shadow duration-300">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <h2 className="text-lg font-medium text-slate-800">Recent Reviews</h2>

            <div className="mt-5">
                {
                    dashboardData.ratings.length > 0 ? (
                        dashboardData.ratings.map((review, index) => (
                            <div key={index} className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl hover:bg-slate-50/50 transition-colors px-2">
                                <div>
                                    <div className="flex gap-3">
                                        <Image src={review.user.image} alt="" className="w-10 aspect-square rounded-full" width={100} height={100} />
                                        <div>
                                            <p className="font-medium text-slate-800">{review.user.name}</p>
                                            <p className="font-light text-slate-500">{new Date(review.createdAt).toDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-slate-500 max-w-xs leading-6">{review.review}</p>
                                </div>
                                <div className="flex flex-col justify-between gap-6 sm:items-end">
                                    <div className="flex flex-col sm:items-end">
                                        <p className="text-slate-400 text-xs uppercase tracking-wider">{review.product?.category}</p>
                                        <p className="font-medium text-slate-700">{review.product?.name}</p>
                                        <div className='flex items-center'>
                                            {Array(5).fill('').map((_, index) => (
                                                <StarIcon key={index} size={15} className='text-transparent mt-0.5' fill={review.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={() => router.push(`/product/${review.product.id}`)} className="bg-white border border-slate-200 px-5 py-2 hover:bg-slate-50 rounded text-slate-600 transition-all text-xs font-medium shadow-sm">View Product</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <StarIcon size={40} className="text-slate-200" />
                            <p className="mt-4 text-slate-400">No reviews received yet.</p>
                        </div>
                    )
                }
            </div>
        </div>
    )
}