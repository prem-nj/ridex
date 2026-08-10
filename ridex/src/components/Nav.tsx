'use client'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import AuthModal from '@/components/AuthModal'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { Bike, Car, ChevronRight, LogOut, Menu, Truck, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import { getSocket } from '@/lib/socket'

const Nav_Items = ["Home", "Bookings", "About Us", "Contact"];

function Nav() {
    const pathName = usePathname()
    const [authOpen, setAuthOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const { userData } = useSelector((state: RootState) => state.user)
    const [pendingCount, setPendingCount] = useState(0)
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    const handleLogOut = async () => {
        await signOut({ redirect: false })
        dispatch(setUserData(null))
        setProfileOpen(false)
    }

    const fetchCount = async () => {
        try {
            const { data } = await axios.get("/api/partner/booking/pending-requests-count")
            console.log(data)
            setPendingCount(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (userData?.role === "partner") {
            fetchCount()
        }
    }, [userData?.role])

    useEffect(() => {
        const socket = getSocket()

        const handleNewBooking = () => {
            setPendingCount(prev => prev + 1)
        }

        socket.on("new-booking", handleNewBooking)

        return () => {
            socket.off("new-booking", handleNewBooking)
        }
    }, [])

    return (
        <>
            <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`fixed top-3 left-1/2 -translate-x-1/2
        w-[94%] md:w-[86%]
        z-50 rounded-full bg-[#0B0B0B] text-white
        shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                    <Image src={"/logo.png"} alt="logo" width={44} height={44} priority />
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {userData?.role === "partner" ? (
                            <>
                                <Link
                                    className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                                    href={"/"}
                                >
                                    Home
                                </Link>
                                <Link
                                    className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                                    href={"/partner/pending-requests"}
                                >
                                    Pending Requests
                                    <span className="absolute -top-2 -right-5 w-6 h-6 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold">
                                        {pendingCount ?? 0}
                                    </span>
                                </Link>
                                <Link
                                    className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                                    href={"/partner/bookings"}
                                >
                                    Bookings
                                </Link>
                                <Link
                                    className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                                    href={"/partner/active-ride"}
                                >
                                    Active Ride
                                </Link>
                            </>
                        ) : (
                            Nav_Items.map((item, index) => {
                                let href = "/";

                                if (item === "Bookings") {
                                    href = "/user/bookings";
                                } else if (item === "About Us") {
                                    href = "/about-us";
                                } else if (item === "Contact") {
                                    href = "/contact";
                                }

                                const active = href === pathName;

                                return (
                                    <Link
                                        key={index}
                                        href={href}
                                        className={`text-sm font-medium transition ${
                                            active ? "text-white" : "text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        {item}
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Right Side Actions */}
                    <div className='flex items-center gap-3 relative'>
                        {/* Desktop User / Auth Button */}
                        <div className='hidden md:block relative'>
                            {!userData ? (
                                <button className='px-4 py-1.5 rounded-full bg-white text-black text-sm'
                                    onClick={() => setAuthOpen(true)}
                                >
                                    Login
                                </button>
                            ) : (
                                <>
                                    <button className='w-11 h-11 rounded-full bg-white text-black font-bold' onClick={() => setProfileOpen(p => !p)}>
                                        {userData.name?.charAt(0).toUpperCase()}
                                    </button>

                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-14 right-0 w-[300px] bg-white text-black rounded-2xl shadow-xl border"
                                            >
                                                <div className='p-5'>
                                                    <p className='font-semibold text-lg'>{userData.name}</p>
                                                    <p className='text-xs uppercase text-gray-500 mb-4'>{userData.role}</p>
                                                    {userData.role !== "partner" && (
                                                        <div className='w-full flex items-center gap-3 pl-3 pb-3 pt-3 hover:bg-gray-100 rounded-xl cursor-pointer' onClick={() => router.push("/user/bookings")}>
                                                            Bookings
                                                            <ChevronRight size={16} className='ml-auto' />
                                                        </div>
                                                    )}

                                                    {userData.role !== "partner" && (
                                                        <div className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl cursor-pointer' onClick={() => router.push("/partner/onboarding/vehicle")}>
                                                            <div className='flex -space-x-2'>
                                                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Bike size={14} /></div>
                                                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Car size={14} /></div>
                                                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Truck size={14} /></div>
                                                            </div>
                                                            Become a Partner
                                                            <ChevronRight size={16} className='ml-auto' />
                                                        </div>
                                                    )}
                                                    <button className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2' onClick={handleLogOut}>
                                                        <LogOut size={16} />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </div>

                        {/* Mobile User / Auth Button */}
                        <div className='md:hidden'>
                            {!userData ? (
                                <button className='px-4 py-1.5 rounded-full bg-white text-black text-sm'
                                    onClick={() => setAuthOpen(true)}
                                >
                                    Login
                                </button>
                            ) : (
                                <button className='w-11 h-11 rounded-full bg-white text-black font-bold' onClick={() => setProfileOpen(p => !p)}>
                                    {userData.name?.charAt(0).toUpperCase()}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
            
            {/* Mobile Sheet / Drawer */}
            <AnimatePresence>
                {profileOpen && userData && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setProfileOpen(false)}
                            className="fixed inset-0 bg-black z-30 md:hidden"
                        />
                        <motion.div
                            initial={{ y: 400 }}
                            animate={{ y: 0 }}
                            exit={{ y: 400 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden text-black"
                        >
                            <div className='p-5'>
                                <p className='font-semibold text-lg'>{userData.name}</p>
                                <p className='text-xs uppercase text-gray-500 mb-4'>{userData.role}</p>

                                {userData.role !== "partner" && (
                                    <div className='w-full flex items-center gap-3 pt-3 pb-3 pl-3 hover:bg-gray-100 rounded-xl cursor-pointer' onClick={() => { setProfileOpen(false); router.push("/user/bookings"); }}>
                                        Bookings
                                        <ChevronRight size={16} className='ml-auto' />
                                    </div>
                                )}
                                {userData.role !== "partner" && (
                                    <div className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl cursor-pointer' onClick={() => { setProfileOpen(false); router.push("/partner/onboarding/vehicle"); }}>
                                        <div className='flex -space-x-2'>
                                            <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Bike size={14} /></div>
                                            <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Car size={14} /></div>
                                            <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Truck size={14} /></div>
                                        </div>
                                        Become a Partner
                                        <ChevronRight size={16} className='ml-auto' />
                                    </div>
                                )}

                                {userData.role === "partner" && (
                                    <div className='flex flex-col gap-4 py-2'>
                                        <Link onClick={() => setProfileOpen(false)} className="relative text-sm font-medium text-black hover:text-gray-500 transition flex items-center justify-between" href={"/partner/pending-requests"}>
                                            <span>Pending Requests</span>
                                            <span className="w-6 h-6 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">{pendingCount ?? 0}</span>
                                        </Link>
                                        <Link onClick={() => setProfileOpen(false)} className="relative text-sm font-medium text-black hover:text-gray-500 transition" href={"/partner/bookings"}>Bookings</Link>
                                        <Link onClick={() => setProfileOpen(false)} className="relative text-sm font-medium text-black hover:text-gray-500 transition" href={"/partner/active-ride"}>Active Ride</Link>
                                    </div>
                                )}

                                <button className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2 text-red-600' onClick={handleLogOut}>
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
    )
}

export default Nav