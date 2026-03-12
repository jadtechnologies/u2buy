import { PlusIcon, SquarePenIcon, XIcon, CreditCard, Truck, MapPin, Receipt, Ticket, ChevronDown, Lock } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import PaymentModal from './PaymentModal';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { clearCart } from '../lib/features/cart/cartSlice';
import Script from 'next/script';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/nextjs';


const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'LKR';

    const router = useRouter();
    const { user } = useUser();
    const { getToken } = useAuth();
    const dispatch = useDispatch();

    const addressList = useSelector(state => state.address.list);
    const { isPlus } = useSelector(state => state.cart);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentOrderId, setPaymentOrderId] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(null);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');

    const getShippingFee = () => {
        if (isPlus) return 0;
        if (!selectedAddress) return 0;

        const city = selectedAddress.city?.toLowerCase().trim();
        if (['colombo', 'dehiwala', 'nugegoda', 'moratuwa'].includes(city)) return 500;
        if (['gampaha', 'negombo', 'panadura', 'kalutara'].includes(city)) return 1000;
        if (['kandy', 'galle', 'matara', 'kurunegala'].includes(city)) return 1500;
        return 2500;
    }

    const shippingFee = getShippingFee();

    const handleCouponCode = async (event) => {
        event.preventDefault();
        try {
            if (!user) {
                return toast('Please login to proceed');
            }

            const token = await getToken();
            const { data } = await axios.post('/api/coupon/verify', { code: couponCodeInput }, { headers: { Authorization: `Bearer ${token}` } });
            setCoupon(data.coupon);
            toast.success('Coupon applied successfully');
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please login to continue');
            return;
        }

        if (!selectedAddress) {
            toast.error('Please select an address');
            return;
        }

        try {
            const token = await getToken();
            const orderData = {
                addressId: selectedAddress.id,
                paymentMethod,
                items: items,
                couponCode: coupon ? coupon.code : null
            };

            const { data } = await axios.post('/api/order', orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (paymentMethod === 'PAYHERE') {
                const mainOrder = data.orders[0];
                const finalAmount = (mainOrder.total + shippingFee).toFixed(2);

                setPaymentOrderId(mainOrder.id);
                setPaymentAmount(finalAmount);
                setShowPaymentModal(true);

                toast.success('Order created. Proceed to payment.');
            } else {
                toast.success('Order placed successfully');
                dispatch(clearCart());
                router.push('/cart');
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error || 'Failed to place order');
        }
    }


    return (
        <div className='w-full max-w-lg lg:max-w-[380px] bg-white border border-slate-200 text-slate-700 rounded-3xl p-8 shadow-xl shadow-slate-200/50 flex flex-col gap-6'>
            <div className='flex items-center gap-2.5 border-b border-slate-100 pb-5'>
                <div className='bg-blue-50 p-2 rounded-xl text-blue-600'>
                    <Receipt size={22} />
                </div>
                <h2 className='text-xl font-bold tracking-tight text-slate-800'>Order Summary</h2>
            </div>

            <Script
                src="https://www.payhere.lk/lib/payhere.js"
                strategy="afterInteractive"
            />

            {/* Payment Method Selection */}
            <div className='space-y-4'>
                <div className='flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest'>
                    <CreditCard size={14} />
                    <span>Payment Method</span>
                </div>
                <div className='grid grid-cols-1 gap-3'>
                    <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                        <div className='flex items-center gap-3'>
                            <input type="radio" name='payment' onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300' />
                            <span className={`font-semibold text-sm ${paymentMethod === 'COD' ? 'text-blue-900' : 'text-slate-600'}`}>Cash on Delivery</span>
                        </div>
                        <div className={`p-1.5 rounded-lg ${paymentMethod === 'COD' ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400'}`}>
                            <Truck size={16} />
                        </div>
                    </label>

                    <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${paymentMethod === 'PAYHERE' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                        <div className='flex items-center gap-3'>
                            <input type="radio" name='payment' onChange={() => setPaymentMethod('PAYHERE')} checked={paymentMethod === 'PAYHERE'} className='w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300' />
                            <span className={`font-semibold text-sm ${paymentMethod === 'PAYHERE' ? 'text-blue-900' : 'text-slate-600'}`}>PayHere Secure</span>
                        </div>
                        <div className={`p-1.5 rounded-lg ${paymentMethod === 'PAYHERE' ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400'}`}>
                            <Lock size={16} />
                        </div>
                    </label>
                </div>
            </div>

            {/* Address Selection */}
            <div className='space-y-4 pt-2'>
                <div className='flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest'>
                    <MapPin size={14} />
                    <span>Delivery Address</span>
                </div>
                <div className='bg-slate-50/80 border border-slate-100 rounded-2xl p-4'>
                    {
                        selectedAddress ? (
                            <div className='flex items-center justify-between gap-3'>
                                <div className='flex-1'>
                                    <p className='font-bold text-slate-800 text-sm'>{selectedAddress.name}</p>
                                    <p className='text-xs text-slate-500 mt-0.5 mt-0.5 line-clamp-1'>{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}</p>
                                </div>
                                <button onClick={() => setSelectedAddress(null)} className='p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400'>
                                    <SquarePenIcon size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                {
                                    addressList.length > 0 ? (
                                        <div className='relative'>
                                            <select
                                                className='w-full bg-white border border-slate-200 p-3 pl-4 pr-10 text-sm font-medium outline-none rounded-xl appearance-none shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all'
                                                onChange={(e) => setSelectedAddress(addressList[e.target.value])}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Choose an address...</option>
                                                {addressList.map((address, index) => (
                                                    <option key={index} value={index}>{address.name} - {address.city}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' size={16} />
                                        </div>
                                    ) : (
                                        <p className='text-xs text-slate-400 italic px-1'>No addresses found on your account.</p>
                                    )
                                }
                                <button className='w-full flex items-center justify-center gap-2 text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 border border-blue-100 py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.98]'
                                    onClick={() => {
                                        if (!user) {
                                            toast.error('Please login to add an address');
                                            return;
                                        }
                                        setShowAddressModal(true);
                                    }} >
                                    <PlusIcon size={16} />
                                    <span>ADD NEW ADDRESS</span>
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>

            {/* Calculations and Coupon */}
            <div className='bg-slate-50/50 rounded-2xl p-5 space-y-4 border border-slate-100 mt-2'>
                <div className='space-y-3 border-b border-slate-200/60 pb-4'>
                    <div className='flex justify-between text-sm'>
                        <span className='text-slate-500'>Subtotal</span>
                        <span className='font-bold text-slate-800'>{currency}{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                        <span className='text-slate-500'>Estimated Shipping</span>
                        <span className={`font-bold ${shippingFee === 0 ? 'text-green-600' : 'text-slate-800'}`}>
                            {shippingFee > 0 ? `${currency}${shippingFee}` : 'FREE'}
                        </span>
                    </div>
                    {coupon && (
                        <div className='flex justify-between text-sm'>
                            <div className='flex items-center gap-1.5'>
                                <span className='text-slate-500'>Discount</span>
                                <span className='bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight'>{coupon.code}</span>
                            </div>
                            <span className='font-bold text-green-600'>-{currency}{(coupon.discount / 100 * totalPrice).toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className='flex justify-between items-center py-2'>
                    <span className='font-bold text-slate-800 text-base'>Total Amount</span>
                    <span className='font-black text-2xl text-blue-600'>
                        {currency}{(parseFloat(coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)) : totalPrice) + shippingFee).toFixed(2)}
                    </span>
                </div>

                {/* Coupon Input */}
                <div className='pt-2'>
                    {
                        !coupon ? (
                            <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking...' })} className='relative flex items-center group'>
                                <Ticket size={16} className='absolute left-3 text-slate-300 group-focus-within:text-blue-500 transition-colors' />
                                <input
                                    onChange={(e) => setCouponCodeInput(e.target.value)}
                                    value={couponCodeInput}
                                    type="text"
                                    placeholder='Promo Code'
                                    className='w-full bg-white border border-slate-200 py-3 pl-10 pr-24 text-xs font-bold rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder-slate-300'
                                />
                                <button className='absolute right-1 top-1 bottom-1 px-4 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-black active:scale-[0.97] transition-all uppercase tracking-widest'>Apply</button>
                            </form>
                        ) : (
                            <div className='bg-green-50/50 border border-green-100 rounded-xl p-3 flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <div className='bg-green-100 p-1.5 rounded-lg text-green-600'>
                                        <Ticket size={14} />
                                    </div>
                                    <div>
                                        <div className='flex items-center gap-1.5'>
                                            <span className='font-black text-xs text-green-800 tracking-tight'>{coupon.code.toUpperCase()}</span>
                                            <span className='text-[10px] font-bold text-green-600 uppercase tracking-tighter'>Applied</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setCoupon('')} className='p-1.5 hover:bg-green-100 rounded-full transition-colors text-green-400'>
                                    <XIcon size={14} />
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>

            <button
                onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'Placing Order...' })}
                className='w-full bg-[#000000] hover:bg-slate-900 text-white font-black py-4.5 py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] uppercase tracking-[0.15em] text-xs'
            >
                Confirm & Place Order
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                orderId={paymentOrderId}
                amount={paymentAmount}
            />

            <Script
                src="https://www.payhere.lk/lib/payhere.js"
                strategy="afterInteractive"
            />
        </div>

    )
}

export default OrderSummary