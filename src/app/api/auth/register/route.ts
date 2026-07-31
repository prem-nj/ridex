import connectDb from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {sendMail} from "@/lib/sendMail"

export async function POST(req:NextRequest){
    try {
        const {name,email,password}=await req.json();
        await connectDb()
       let user=await User.findOne({email});
        if(user && user.isEmailVerified){
            return NextResponse.json({message:"email already exist"},{status:400})
        }

        const otp=Math.floor(10000+Math.random()*90000).toString()
        const otpExpireAt=new Date(Date.now()+10*60*1000)
        const hashedPassword=await bcrypt.hash(password,10);
        if(user && !user.isEmailVerified){
            user.otp=otp, 
            user.otpExpiresAt=otpExpireAt,
            user.password=hashedPassword,
            user.email=email

        }else{

            user=await User.create({
               name,email,password:hashedPassword,otp,otpExpireAt
           })

        }

        await sendMail(
            email,
            "Your OTP for Email Verification",
            `<h2>Your Email Verification OTP is <strong>${otp}</strong></h2>`
            
        )


      if(password.length<6){
         return NextResponse.json({message:"password must be greater than 6 characters"},{status:400})
      }


       return NextResponse.json(
        user,
        {status:201}
       )

    } catch (error) {

        return NextResponse.json({message:`register error ${error}`},{status:500})
        
    }
}