'use client';

import { CheckIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { assets } from '@/assets/assets';

import { useRouter } from 'next/navigation';

const CheckoutSidebar = ({ isOpen, onClose, isAnnual }) => {
    if (!isOpen) return null;

    const planPrice = isAnnual ? 15000 : 2000;
    const planName = isAnnual ? 'Plus (Annual)' : 'Plus (Monthly)';

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0  " onClick={onClose}></div>

            {/* Sidebar */}
            <div className="mt-[30px] relative w-full max-w-md bg-white h-[670px] shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300 rounded-[5px]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Checkout</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <XIcon size={20} />
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-slate-800">{planName} <span className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded ml-2">Free trial</span></p>
                            <p className="text-sm text-slate-500">LKR {planPrice.toLocaleString()} per {isAnnual ? 'year' : 'month'}</p>
                        </div>
                        <p className="font-medium text-slate-800">LKR {planPrice.toLocaleString()}</p>
                    </div>

                    <div className="flex justify-between text-sm text-slate-500">
                        <p>Subtotal</p>
                        <p>LKR {planPrice.toLocaleString()}</p>
                    </div>

                    <div className="flex justify-between text-sm text-slate-500">
                        <p>Total Due after trial ends in 7 days</p>
                        <p>LKR {planPrice.toLocaleString()}</p>
                    </div>

                    <div className="flex justify-between font-bold text-lg text-slate-800 border-t pt-4 mt-4">
                        <p>Total Due Today</p>
                        <p>LKR 0.00</p>
                    </div>
                </div>

                {/* Simulated Payment Form */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700">Card details</h3>

                    <div className="border border-slate-300 rounded-lg overflow-hidden p-3 bg-white flex items-center justify-between">
                        <input type="text" placeholder="1234 5678 1234 1234" className="w-full outline-none text-slate-700 placeholder-slate-400" />
                        <div className="flex gap-2">
                            <img className="h-4 object-contain" src={assets.visa.src} alt="Visa" />
                            <img className="h-4 object-contain" src={assets.mastercard.src} alt="Mastercard" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-lg overflow-hidden p-3 bg-white">
                            <input type="text" placeholder="MM / YY" className="w-full outline-none text-slate-700 placeholder-slate-400" />
                        </div>
                        <div className="border border-slate-300 rounded-lg overflow-hidden p-3 bg-white">
                            <input type="text" placeholder="CVC" className="w-full outline-none text-slate-700 placeholder-slate-400" />
                        </div>
                    </div>

                    <div className="border border-slate-300 rounded-lg overflow-hidden p-3 bg-white">
                        <select className="w-full outline-none text-slate-700 bg-transparent">
                            <option>Sri Lanka</option>
                            <option>India</option>
                            <option>United States</option>
                        </select>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                        By providing your card information, you allow GoCart to charge your card for future payments in accordance with our terms.
                    </p>

                    <button className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition active:scale-[0.98]">
                        Start free trial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const router = useRouter();

    return (
        <div className='mx-auto max-w-7xl px-6 my-13'>
            {/* <div className="text-center mb-10">
                <h2 className="text-3xl font-semibold text-slate-700">GoCart Plus</h2>
                <p className="text-slate-500 mt-2">Unlock free shipping and exclusive deals. Try it free for 7 days.</p>
            </div> */}

            <CheckoutSidebar isOpen={showCheckout} onClose={() => setShowCheckout(false)} isAnnual={isAnnual} />

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow relative overflow-hidden bg-white flex flex-col h-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Free</h3>
                            <div className="my-4">
                                <span className="text-3xl font-extrabold text-slate-900">LKR 0</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-6">Always free</p>
                        </div>
                        <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">Active</span>
                    </div>

                    <ul className="mt-4 space-y-4 text-sm text-slate-600">
                        <li className="flex gap-3 items-center"><CheckIcon className="text-slate-400 shrink-0" size={18} /> Standard Shipping Rates</li>
                        <li className="flex gap-3 items-center"><CheckIcon className="text-slate-400 shrink-0" size={18} /> Limited Coupons</li>
                        <li className="flex gap-3 items-center"><CheckIcon className="text-slate-400 shrink-0" size={18} /> No Early Access to Sales</li>
                        <li className="flex gap-3 items-center"><CheckIcon className="text-slate-400 shrink-0" size={18} /> Limited Cashback & Rewards</li>
                    </ul>

                    <button onClick={() => router.push('/shop')} className="w-full mt-[50px] py-3 rounded-lg border-2 border-slate-900 text-slate-900 font-semibold hover:bg-slate-50 transition">
                        Get Started Free
                    </button>
                </div>

                {/* Plus Plan */}
                <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow relative overflow-hidden bg-white shadow-sm flex flex-col h-full">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Plus</h3>
                        <div className="my-4 flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-slate-900">LKR {isAnnual ? '15,000' : '2,000'}</span>
                            <span className="text-slate-500 font-medium">{isAnnual ? '/year' : '/month'}</span>
                        </div>

                        {/* Toggle */}
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className={`w-12 h-6 flex items-center bg-slate-200 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isAnnual ? 'bg-slate-900' : ''}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-6' : ''}`}></div>
                            </button>
                            <span className="text-sm text-slate-600 font-medium">Billed annually</span>
                        </div>
                    </div>

                    <ul className="mt-4 space-y-4 text-sm text-slate-600">
                        <li className="flex gap-3 items-center"><CheckIcon className="text-slate-800 shrink-0" size={18} /> Member-Exclusive Coupons</li>
                        <li className="flex gap-3 items-center"><CheckIcon className="text-slate-800 shrink-0" size={18} /> Exclusive Discounts</li>
                        <li className="flex gap-3 items-center"><CheckIcon className="text-slate-800 shrink-0" size={18} /> Early Access to Sales</li>
                        <li className="flex gap-3 items-center"><CheckIcon className="text-slate-800 shrink-0" size={18} /> Cashback & Rewards Boost</li>
                        <li className="flex gap-3 items-center"><CheckIcon className="text-slate-800 shrink-0" size={18} /> Free or Faster Shipping</li>
                    </ul>

                    <button onClick={() => setShowCheckout(true)} className="w-full mt-[11px] py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                        Start 7-day free trial
                    </button>
                </div>
            </div>
        </div>
    )
}