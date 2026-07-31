
'use client'
import { SessionProvider } from 'next-auth/react'

import React, { Children, ReactNode } from 'react'


function Provider({children}:{children:ReactNode}) {
  return (
    <SessionProvider>
        {children}
    </SessionProvider>
  )
}

export default Provider