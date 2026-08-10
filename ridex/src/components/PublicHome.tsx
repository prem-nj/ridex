'use client'
import React, { useState } from 'react'
import Herosection from './Herosection'
import VechileSlider from './VechileSlider'
import AuthModel from '@/components/AuthModal'

const PublicHome = () => {
    const [authOpen, setauthOpen] = useState(true)
  return (
    <>
    
    <Herosection onAuthRequired={()=>{setauthOpen(true)}}/>
    <VechileSlider/>
    <AuthModel open={authOpen} onClose={()=>setauthOpen(false)} />
    </>
  )
}

export default PublicHome