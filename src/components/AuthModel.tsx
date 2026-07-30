import React from 'react'

type propType={
open:boolean,
onClose:()=>void
}

const AuthModel = ({open,onClose}:propType) => {
  return (
    <div>AuthModel</div>
  )
}

export default AuthModel