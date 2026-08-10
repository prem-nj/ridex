'use client'
import { registerSocketIdentity } from '@/lib/socket'
import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

function useGetMe(enabled:boolean) {
  const dispatch=useDispatch()

  return (
    useEffect(() => {
      if(!enabled){
        return
      }
 const getMe=async ()=>{
  try {
    const {data}=await axios.get("/api/user/me")
    dispatch(setUserData(data))
    // Every page needs the socket mapped to this user, otherwise events
    // emitted to them from the API are dropped by the socket server.
    registerSocketIdentity(data?._id)
  } catch (error) {
    // User is not authenticated or session expired
    dispatch(setUserData(null))
  }
 }
 getMe()

    }, [enabled])

  )
}

export default useGetMe
