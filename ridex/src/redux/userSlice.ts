import { IUser } from '@/models/user.model'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface IuserState {
  userData:IUser | null
}

const initialState: IuserState = {
  userData:null
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {

    setUserData:(state,action)=>{
        state.userData=action.payload
    }


  },
})

// Action creators are generated for each case reducer function
export const { setUserData } = userSlice.actions

export default userSlice.reducer