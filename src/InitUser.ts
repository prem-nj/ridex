'use client'

import { useSession } from 'next-auth/react'
import useGetMe from './hooks/useGetMe'

function InitUser() {
  const { status, data } = useSession()

  console.log("status:", status)
  console.log("session:", data)

  useGetMe(status === "authenticated")

  return null
}

export default InitUser