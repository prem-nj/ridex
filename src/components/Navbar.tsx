'use client'

import React, { useState } from 'react'
import Image from 'next/image'

import { AnimatePresence, motion } from "motion/react"

import Link from 'next/link'
import { redirect, usePathname, useRouter } from 'next/navigation'
import AuthModel from './AuthModel'


import { Bike, Car, ChevronRight, LogOut, Menu, Truck, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, RootState } from '@/redux/store'
import { signOut, useSession } from 'next-auth/react'
import { setUserData } from '@/redux/userSlice'
import useGetMe from '@/hooks/useGetMe'
const navitems = ["Home", "Booking", "About us", "Contact"]
function Navbar() {
  const pathName = usePathname();

  const [authOpen, setauthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
    const router = useRouter()


   const { userData } = useSelector((state: RootState) => state.user)
   const dispatch=useDispatch<AppDispatch>()
   const { data: session } = useSession()
   useGetMe(!!session?.user)

  const handleLogOut=async ()=>{
    await signOut({redirect:false})
    dispatch(setUserData(null))
    setProfileOpen(false)

  }

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
        
        
        
        
        
        

        
        
        
        
        <div className='max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between'>

          <Image src={"/logo.jpg"} alt='logo' width={48} height={48} priority className='rounded-xl' />
          <div className='hidden md:flex items-center gap-10'>
            <div className='hidden md:flex items-center gap-10'>

                {userData?.role == "partner" ? (
                    <>
                        <Link className="relative text-sm font-medium text-gray-300 hover:text-white transition" href={"/"}>Home</Link>
                        <Link className="relative text-sm font-medium text-gray-300 hover:text-white transition" href={"/partner/pending-requests"}>Pending Requests
                        <span className="absolute -top-2 -right-5 w-6 h-6 bg-white text-black text-xs rounded-full flex items-center justify-center font-bold">{pendingCount ?? 0}</span>
                        </Link>
                        <Link className="relative text-sm font-medium text-gray-300 hover:text-white transition" href={"/partner/bookings"}>Bookings</Link>
                        <Link className="relative text-sm font-medium text-gray-300 hover:text-white transition" href={"/partner/active-ride"}>Active Ride</Link>
                    </>
                ) :
                   null
                }


            </div>


            {navitems.map((i, index) => {

              let href;
              if (i == "Home") {
                href = `/`
              } else {
                href = `/${i.toLowerCase()}`

              }

              const active = href == pathName
              return <Link key={index} href={href} className={
                `
                    text-sm front-medium 
                  transition ${active ? "text-white" : "text-gray-400 hover:text-white"}
                   
                   `}>{i}</Link>
            })}
          </div>



          <div className='flex items-center gap-3 relative'>

            <div className='hidden md:block relative'>
              {!userData ? (
                <button className='px-4 py-1.5 rounded-full bg-white text-black text-sm'
                  onClick={() => setauthOpen(true)}
                >
                  Login
                </button>
              ) : (
                <>
                  <button className='w-11 h-11 rounded-full bg-white text-black font-bold' onClick={() => setProfileOpen(p => !p)}>
                     {userData?.name?.charAt(1).toUpperCase() as string || userData?.email?.charAt(0).toUpperCase() }
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
                          {userData.role != "partner" && (
                            <div className='w-full flex items-center gap-3 pl-3 pb-3 pt-3 hover:bg-gray-100 rounded-xl' onClick={() => router.push("/user/bookings")}>
                              Bookings
                              <ChevronRight size={16} className='ml-auto' />
                            </div>
                          )
                          }
                          {userData.role == "partner" && (
                            <div className='w-full flex items-center gap-3 pl-3 pb-3 pt-3 hover:bg-gray-100 rounded-xl' onClick={() => router.push("/partner")}>
                              Partner Dashboard
                              <ChevronRight size={16} className='ml-auto' />
                            </div>
                          )
                          }
                          {userData.role != "partner" && (
                            <div className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl' onClick={() => router.push("/partner/onboarding/vehicle")}>
                              <div className='flex -space-x-2'>
                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'> <Bike size={14} /></div>
                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Car size={14} /></div>
                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Truck size={14} /></div>

                              </div>
                              Become a Partner
                              <ChevronRight size={16} className='ml-auto' />
                            </div>
                          )
                          }
                          <button className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2' onClick={handleLogOut}>
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>

                </>
              )


              }
            </div>


            <div className='md:hidden '>
              {!userData ? (
                <button className='px-4 py-1.5 rounded-full bg-white text-black text-sm'
                  onClick={() => setauthOpen(true)}
                >
                  Login
                </button>
              ) : (
                <>
                  <button className='w-11 h-11 rounded-full bg-white text-black font-bold' onClick={() => setProfileOpen(p => !p)}>
                     {userData?.name ? userData.name.charAt(0).toUpperCase() : userData?.email?.charAt(0).toUpperCase() || '?'}
                  </button>


                </>
              )


              }
            </div>


          </div>



        </div>
      </motion.div>
      <AuthModel open={authOpen} onClose={() => { setauthOpen(false) }} />

    </>
  )
}

export default Navbar