import React, { useState } from 'react'

import { motion } from "motion/react"
import { X } from 'lucide-react'
import Image from "next/image"
type propType = {
  open: boolean,
  onClose: () => void
}

const AuthModel = ({ open, onClose }: propType) => {
  const [step, setstep] = useState()
  return (
    <>
      {open &&
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
            className='fixed inset-0 z-[90] bg-black/80 backdrop-blur-md'
          >


          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          >

            <div className='relative w-full max-w-md bg-white border border-black/10  shadow-[0_40px_100px_rgba(0,0,0,0.35)]  p-6 sm:p-8  rounded-2xl'>

              <div className='absolute right-4 top-4 text-gray-500 hover:text-black transition' onClick={onClose}>
                <X size={20} />
              </div>
              <div className='mb-6 text-center'>
                                    <h1 className='text-3xl font-extrabold text-black tracking-widest'>RIDEX</h1>
                                    <p className='mt-1 text-xs text-gray-500'>Premium Vehicle Booking</p>
                                </div>

            
                                <button className=' w-full h-11 rounded-xl
                  border border-black/20
                  flex items-center justify-center gap-3
                  text-sm font-semibold text-black
                  hover:bg-black hover:text-white
                  transition' >
                                    <Image src="/google.png" alt='Google' width={20} height={20} />
                                    Continue with Google
                                </button>
                                 <div className='flex items-center gap-4 my-6'>
                                    <div className='flex-1 h-px bg-black/10' />
                                    <div className='text-xs text-gray-500'>OR</div>
                                    <div className='flex-1 h-px bg-black/10' />
                                </div>
                    </div>

          </motion.div>


        </>
      }

    </>
  )
}

export default AuthModel