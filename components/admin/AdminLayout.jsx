'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { useUser, useAuth } from "@clerk/nextjs"
import axios from "axios"

const AdminLayout = ({ children }) => {
    const { user } = useUser()
    const { getToken } = useAuth()

    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchIsAdmin = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get("/api/admin/is-admin", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setIsAdmin(data.isAdmin)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchIsAdmin()
        }
    }, [user])

    return loading ? (
        <Loading />
    ) : isAdmin ? (
        <div className="flex flex-col h-screen">
            <AdminNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <AdminSidebar />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
            {user && (
                <div className="mt-4">
                    <p className="text-slate-500 italic">Logged in as: <span className="font-bold text-slate-700">{user.primaryEmailAddress?.emailAddress}</span></p>
                    <p className="text-xs text-slate-400 mt-1">(Expected: {process.env.NEXT_PUBLIC_ADMIN_EMAIL})</p>
                </div>
            )}
            <div className="flex gap-4 mt-8">
                <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full">
                    Go to home <ArrowRightIcon size={18} />
                </Link>
                <button
                    onClick={() => window.location.href = '/'}
                    className="border border-slate-300 text-slate-600 p-2 px-6 max-sm:text-sm rounded-full hover:bg-slate-50"
                >
                    Switch Account
                </button>
            </div>
        </div>
    )
}

export default AdminLayout