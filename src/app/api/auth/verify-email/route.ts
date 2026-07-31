import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const { otp, email } = await req.json()
        let user = await User.findOne({ email });

        if (!email && !otp) {
            return NextResponse.json({ message: "email and otp required " }, { status: 400 })
        }

        if (!user) {
            return NextResponse.json({ message: "user not found " }, { status: 400 })
        }
        if (user.isEmailVerified) {
            return NextResponse.json({ message: "user email already verified " }, { status: 400 })
        }

        if (!user.otpExpireAt || user.otpExpireAt < new Date()) {
            return NextResponse.json({ message: "user email already verified " }, { status: 400 })
        }

        if (!user.otpExpireAt || user.otpExpireAt < new Date()) {
            return NextResponse.json(
                { message: "user email already verified " }, { status: 400 }

            )
        }

        if (!user.otp || user.otp != otp) {
            return Response.json(
                { message: "invalid otp" },
                { status: 400 }
            )
        }

        user.isEmailVerified=true,
        user.otp=undefined,
        user.otpExpireAt=undefined

        await user.save()

 return Response.json(
                { message: "email is verified" },
                { status: 200 }
            )

    

    } catch (error) {
     return Response.json(
                { message: `verify email error ${error}` },
                { status: 500 }
            )    

    }
}