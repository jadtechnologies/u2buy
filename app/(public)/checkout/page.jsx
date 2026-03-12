'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { useUser, useAuth } from '@clerk/nextjs'
import axios from 'axios'
import toast from 'react-hot-toast'
import Script from 'next/script'
import { CreditCard, Globe, Info, Lock, ChevronDown } from 'lucide-react'

const CheckoutContent = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useUser()
    const { getToken } = useAuth()

    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    // Form states
    const [email, setEmail] = useState('')
    const [cardHolderName, setCardHolderName] = useState('')
    const [country, setCountry] = useState('India')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvc, setCvc] = useState('')

    // Validation States
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (user) {
            setEmail(user.emailAddresses[0]?.emailAddress || '')
            setCardHolderName(`${user.firstName || ''} ${user.lastName || ''}`.trim())
        }
    }, [user])

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const parts = []
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substring(i, i + 4))
        }
        return parts.join(' ').substring(0, 19)
    }

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9/]/gi, '')
        if (v.length === 2 && !v.includes('/')) {
            return v + ' / '
        }
        return v.substring(0, 7)
    }

    const validateForm = () => {
        const newErrors = {}

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = 'Please enter a valid email address.'
        }

        const cleanCard = cardNumber.replace(/\s/g, '')
        if (cleanCard.length < 16) {
            newErrors.cardNumber = 'Incomplete card number.'
        }

        if (!expiry.match(/^(0[1-9]|1[0-2])\s\/\s\d{2}$/)) {
            newErrors.expiry = 'Invalid expiry date.'
        } else {
            const [month, year] = expiry.split(' / ')
            const now = new Date()
            const currentYear = parseInt(now.getFullYear().toString().slice(-2))
            const currentMonth = now.getMonth() + 1
            if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                newErrors.expiry = 'Your card has expired.'
            }
        }

        if (cvc.length < 3) {
            newErrors.cvc = 'Incomplete CVC.'
        }

        if (cardHolderName.trim().length < 3) {
            newErrors.name = 'Please enter your full name.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handlePayment = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        if (!window.payhere) {
            toast.error("Payment system not loaded. Please refresh.")
            return
        }
        setIsSubmitting(true)

        try {
            const token = await getToken()
            const finalAmount = parseFloat(amount).toFixed(2)

            const hashRes = await axios.post('/api/order/payhere-hash', {
                orderId: orderId,
                amount: finalAmount,
                currency: 'LKR',
            })

            const payment = {
                sandbox: process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true',
                merchant_id: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID,
                return_url: window.location.origin + '/orders',
                cancel_url: window.location.href,
                notify_url: window.location.origin + '/api/order/payhere-notify',
                order_id: orderId,
                items: 'Order #' + orderId,
                amount: finalAmount,
                currency: 'LKR',
                hash: hashRes.data.hash,
                first_name: user?.firstName || 'Guest',
                last_name: user?.lastName || 'User',
                email: email,
                phone: '0712345678',
                address: 'Checkout',
                city: 'Colombo',
                country: 'Sri Lanka',
            }

            window.payhere.onCompleted = function (orderId) {
                toast.success("Payment completed successfully!")
                router.push('/cart')
            }

            window.payhere.onDismissed = function () {
                toast.error("Payment dismissed")
                setIsSubmitting(false)
            }

            window.payhere.onError = function (error) {
                toast.error("Error:" + error)
                setIsSubmitting(false)
            }

            window.payhere.startPayment(payment)
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.error || 'Failed to initiate payment')
            setIsSubmitting(false)
        }
    }

    if (!orderId || !amount) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">Invalid Access</h1>
                <button onClick={() => router.push('/')} className="bg-slate-800 text-white px-6 py-2 rounded-md">Go Home</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-[#30313d]">
            {/* Left Side: Order Total */}
            <div className="md:w-1/2 p-8 md:p-24 flex flex-col items-center md:items-end justify-start min-h-[40vh] md:min-h-screen">
                <div className="max-w-xs w-full">
                    <div className="flex items-center gap-3 mb-12">
                        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 transition">
                            <span className="text-xl">←</span>
                        </button>
                        <div className="w-5 h-5 bg-slate-200 rounded flex items-center justify-center">
                            <div className="w-2.5 h-2.5 border-2 border-slate-400 rounded-full"></div>
                        </div>
                        {process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true' && (
                            <span className="bg-[#ffb000] text-white text-[10px] font-black px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider">Test Mode</span>
                        )}
                    </div>
                    <p className="text-[#697386] text-sm font-medium mb-1">Order</p>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                        LKR {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h1>
                </div>
            </div>

            {/* Right Side: Checkout Form */}
            <div className="md:w-1/2 p-8 md:p-24 flex flex-col items-center md:items-start bg-white min-h-screen border-l border-slate-100 shadow-[inset_1px_0_0_rgba(0,0,0,0.05)]">
                <div className="max-w-md w-full">
                    {/* Pay with link button */}
                    <button type="button" className="w-full bg-[#1de9b6] hover:bg-[#1bc69b] text-[#004d40] font-bold py-3.5 rounded-lg flex items-center justify-center gap-2.5 transition-all shadow-sm mb-10 transform active:scale-[0.98]">
                        <div className="bg-[#004d40] text-[#1de9b6] rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-tighter">Link</div>
                        <span className="tracking-tight">Pay with link</span>
                    </button>

                    <div className="relative flex items-center mb-8">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">Or</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-6">
                        {/* Email Section */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#30313d]">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: null }) }}
                                className={`w-full border rounded-[4px] p-2.5 outline-none transition-all shadow-sm focus:ring-2 focus:ring-[#635bff33] focus:border-[#635bff] ${errors.email ? 'border-[#df1b41]' : 'border-slate-300'}`}
                                placeholder="email@example.com"
                            />
                            {errors.email && <p className="text-[#df1b41] text-[13px] mt-1.5 flex items-center gap-1 font-medium"><span className="text-lg">!</span> {errors.email}</p>}
                        </div>

                        {/* Payment Method Section */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#30313d]">Payment method</label>
                            <div className={`border rounded-[4px] overflow-hidden shadow-sm transition-all bg-white ${(errors.cardNumber || errors.expiry || errors.cvc) ? 'border-[#df1b41]' : 'border-slate-300'}`}>
                                <div className="p-3">
                                    <div className="flex items-center justify-between mb-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] font-medium text-slate-400">Card information</span>
                                        </div>
                                        <div className="flex gap-1 items-center">
                                            <Image src={assets.visa} alt="Visa" width={28} height={18} className="h-4 w-auto object-contain brightness-95" />
                                            <Image src={assets.mastercard} alt="MC" width={24} height={18} className="h-4 w-auto object-contain brightness-95" />
                                            <div className="bg-slate-50 border border-slate-200 rounded px-1 text-[8px] font-black text-slate-400">AMEX</div>
                                            <div className="bg-slate-50 border border-slate-200 rounded px-1 text-[8px] font-black text-slate-400">...</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Card Number */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={cardNumber}
                                                onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); if (errors.cardNumber) setErrors({ ...errors, cardNumber: null }) }}
                                                className="w-full border-0 p-0 focus:ring-0 text-sm placeholder-slate-300 font-medium"
                                                placeholder="1234 1234 1234 1234"
                                                maxLength={19}
                                            />
                                        </div>

                                        {/* Expiry and CVC */}
                                        <div className="flex border-t border-slate-100 pt-3">
                                            <div className="w-1/2 overflow-hidden">
                                                <input
                                                    type="text"
                                                    value={expiry}
                                                    onChange={(e) => { setExpiry(formatExpiry(e.target.value)); if (errors.expiry) setErrors({ ...errors, expiry: null }) }}
                                                    className="w-full border-0 p-0 focus:ring-0 text-sm placeholder-slate-300 font-medium"
                                                    placeholder="MM / YY"
                                                    maxLength={7}
                                                />
                                            </div>
                                            <div className="w-1/2 border-l border-slate-100 pl-4 flex items-center justify-between">
                                                <input
                                                    type="text"
                                                    value={cvc}
                                                    onChange={(e) => { setCvc(e.target.value.replace(/\D/g, '').substring(0, 4)); if (errors.cvc) setErrors({ ...errors, cvc: null }) }}
                                                    className="w-full border-0 p-0 focus:ring-0 text-sm placeholder-slate-300 font-medium"
                                                    placeholder="CVC"
                                                />
                                                <CreditCard size={16} className="text-slate-300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {(errors.cardNumber || errors.expiry || errors.cvc) && (
                                <p className="text-[#df1b41] text-[13px] flex items-center gap-1 font-medium">
                                    <span className="text-lg">!</span>
                                    {errors.cardNumber || errors.expiry || errors.cvc}
                                </p>
                            )}
                        </div>

                        {/* Name Section */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#30313d]">Cardholder name</label>
                            <input
                                type="text"
                                value={cardHolderName}
                                onChange={(e) => { setCardHolderName(e.target.value); if (errors.name) setErrors({ ...errors, name: null }) }}
                                className={`w-full border rounded-[4px] p-2.5 outline-none transition-all shadow-sm focus:ring-2 focus:ring-[#635bff33] focus:border-[#635bff] ${errors.name ? 'border-[#df1b41]' : 'border-slate-300'}`}
                                placeholder="Full name on card"
                            />
                            {errors.name && <p className="text-[#df1b41] text-[13px] mt-1.5 flex items-center gap-1 font-medium"><span className="text-lg">!</span> {errors.name}</p>}
                        </div>

                        {/* Country Section */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#30313d]">Country or region</label>
                            <div className="relative">
                                <select
                                    className="w-full border border-slate-300 rounded-[4px] p-2.5 outline-none appearance-none bg-white text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-[#635bff33] focus:border-[#635bff]"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    <option>India</option>
                                    <option>Sri Lanka</option>
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={16} />
                            </div>
                        </div>

                        {/* Checkbox Section */}
                        <div className="flex items-start gap-3 py-2 cursor-pointer group">
                            <div className="pt-0.5">
                                <input type="checkbox" id="save-info" className="w-4 h-4 rounded-sm border-slate-300 text-[#0070f3] focus:ring-[#0070f333] cursor-pointer" />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="save-info" className="text-[13px] text-slate-600 font-medium cursor-pointer">Save my information for faster checkout</label>
                                <p className="text-[11px] text-slate-400 mt-0.5">Pay securely on this site and everywhere Link is accepted.</p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <script type="text/javascript" src="https://www.payhere.lk/lib/payhere.js"></script>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-[#0070f3] hover:bg-[#0061d1] text-white font-bold py-3.5 px-4 rounded-[4px] transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isSubmitting ? 'Processing...' : `Pay`}
                        </button>

                        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-6">
                            <span>Powered by <span className="font-bold">stripe</span></span>
                            <span className="h-3 w-[1px] bg-slate-200"></span>
                            <span className="hover:text-slate-600 cursor-pointer">Terms</span>
                            <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
                        </div>
                    </form>
                </div>
            </div>

            <Script
                src="https://www.payhere.lk/lib/payhere.js"
                strategy="afterInteractive"
            />
        </div>
    )
}

const CheckoutPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    )
}

export default CheckoutPage
