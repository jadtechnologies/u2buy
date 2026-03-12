'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { useUser, useAuth } from '@clerk/nextjs'
import axios from 'axios'
import toast from 'react-hot-toast'
import Script from 'next/script'
import { CreditCard, Lock, ChevronDown, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { clearCart } from '@/lib/features/cart/cartSlice'

const PaymentModal = ({ isOpen, onClose, orderId, amount }) => {
    const { user } = useUser()
    const { getToken } = useAuth()
    const router = useRouter()
    const dispatch = useDispatch()
    const [payHereReady, setPayHereReady] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentId, setPaymentId] = useState('');

    // Form states
    const [email, setEmail] = useState('')
    const [cardHolderName, setCardHolderName] = useState('')
    const [country, setCountry] = useState('Colombo')
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

    // Load PayHere script (always use production lib URL; sandbox mode is set via payment object)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const prodUrl = 'https://www.payhere.lk/lib/payhere.js';

        const loadScript = (url) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
                document.head.appendChild(script);
            });
        };

        const tryLoad = async () => {
            if (window.payhere) {
                setPayHereReady(true);
                return;
            }

            try {
                await loadScript(prodUrl);
                setPayHereReady(true);
            } catch (e) {
                console.error(`PayHere script failed to load from ${prodUrl}:`, e);
                toast.error('Payment gateway could not be loaded. Please check your network or try again later.');
            }
        };

        tryLoad();
    }, []);

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const parts = []
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substring(i, i + 4))
        }
        return parts.join(' ').substring(0, 19)
    }

    const formatExpiry = (value) => {
        const v = value.replace(/\D/g, '')
        if (v.length > 2) {
            return `${v.substring(0, 2)} / ${v.substring(2, 4)}`
        }
        return v
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

        setIsSubmitting(true)

        try {
            // Mock API delay to simulate processing
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Tell the database that the order was paid successfully
            if (orderId) {
                const token = await getToken();
                await axios.post('/api/order/mark-paid', { orderId }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            const randomPaymentId = Math.floor(100000000000 + Math.random() * 900000000000).toString()
            setPaymentId(randomPaymentId)
            setPaymentSuccess(true)

            // Wait 5 seconds to let user read, then clear cart & route
            setTimeout(() => {
                dispatch(clearCart())
                onClose()
                router.push('/cart')
            }, 5000)

        } catch (error) {
            console.error(error)
            toast.error('Failed to initiate payment')
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    if (paymentSuccess) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] overflow-hidden relative animate-in fade-in zoom-in duration-300">
                    <button onClick={() => { dispatch(clearCart()); onClose(); router.push('/cart'); }} className="absolute top-4 right-4 text-white/80 hover:text-white transition z-10">
                        <XIcon size={20} />
                    </button>

                    {/* Header */}
                    <div className="bg-[#244bd7] text-white p-6 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md shrink-0">
                                <div className="font-bold text-blue-600 text-sm italic tracking-tighter leading-none">
                                    Pay<span className="text-[#f5a623]">Here</span>
                                </div>
                            </div>
                            <div className="pt-1">
                                <h3 className="font-bold text-[17px] leading-tight mb-0.5 mt-0">{user?.firstName || cardHolderName.split(' ')[0] || 'Avishka'}</h3>
                                <p className="text-white/80 text-[11px] mb-1.5 line-clamp-1">{`Order #${orderId || '12345'}`}</p>
                                <div className="font-bold text-[22px] tracking-tight">Rs. {parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 pb-6 text-center flex flex-col items-center">
                        <p className="text-slate-400 font-bold tracking-widest text-[13px] mb-8">THANK YOU!</p>

                        <div className="w-20 h-20 rounded-full border-[6px] border-[#38d486] flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-[#38d486]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <p className="text-slate-500 font-bold text-lg mb-2">Payment Approved</p>
                    </div>

                    {/* Footer */}
                    <div className="bg-[#f4f6f8] p-6 pt-5 text-center border-t border-slate-100">
                        <p className="text-slate-400 text-[13px] font-medium mb-1 relative z-10">Payment ID #{paymentId}</p>
                        <p className="text-slate-400/80 text-[11px] leading-relaxed max-w-[250px] mx-auto">
                            You'll receive an Email Receipt with this Payment ID for further reference
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] bg-white/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            {/* PayHere script is loaded via useEffect */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-[480px] p-8 md:p-10 relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
                    <XIcon size={20} />
                </button>

                <form onSubmit={handlePayment} className="space-y-6 pt-2">
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
                                <div className="flex items-center justify-between mb-4 pb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-medium text-slate-400">Card information</span>
                                    </div>
                                    <div className="flex gap-1.5 items-center">
                                        <Image src={assets.visa} alt="Visa" width={28} height={18} className="h-4 w-auto object-contain brightness-95" />
                                        <Image src={assets.mastercard} alt="MC" width={24} height={18} className="h-4 w-auto object-contain brightness-95" />
                                        <div className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[8px] font-black text-slate-400 tracking-tighter">...</div>
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

                    {/* District Section */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[#30313d]">District</label>
                        <div className="relative">
                            <select
                                className="w-full border border-slate-300 rounded-[4px] p-2.5 outline-none appearance-none bg-white text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-[#635bff33] focus:border-[#635bff]"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            >
                                <option>Colombo</option>
                                <option>Gampaha</option>
                                <option>Kalutara</option>
                                <option>Kandy</option>
                                <option>Matale</option>
                                <option>Nuwara Eliya</option>
                                <option>Galle</option>
                                <option>Matara</option>
                                <option>Hambantota</option>
                                <option>Jaffna</option>
                                <option>Kilinochchi</option>
                                <option>Mannar</option>
                                <option>Vavuniya</option>
                                <option>Mullaitivu</option>
                                <option>Batticaloa</option>
                                <option>Ampara</option>
                                <option>Trincomalee</option>
                                <option>Kurunegala</option>
                                <option>Puttalam</option>
                                <option>Anuradhapura</option>
                                <option>Polonnaruwa</option>
                                <option>Badulla</option>
                                <option>Moneragala</option>
                                <option>Ratnapura</option>
                                <option>Kegalle</option>
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
                    <button
                        type="submit"
                        disabled={isSubmitting || !payHereReady}
                        className={`w-full bg-[#0070f3] hover:bg-[#0061d1] text-white font-bold py-3.5 px-4 rounded-[4px] transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''} ${!payHereReady ? 'opacity-50 cursor-not-allowed' : ''}`}
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
    )
}

export default PaymentModal
