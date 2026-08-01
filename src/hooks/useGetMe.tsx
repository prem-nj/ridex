'use client'
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
  const {data}=await axios.get("/api/user/me")
  dispatch(setUserData(data))
  console.log(data)
}
getMe()

    }, [enabled])

  )
}

export default useGetMe
