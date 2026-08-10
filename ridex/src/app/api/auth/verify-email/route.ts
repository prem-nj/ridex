import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const { otp, email } = await req.json()
        const user = await User.findOne({ email });

        if (!email || !otp) {
            return NextResponse.json({ message: "email and otp required " }, { status: 400 })
        }

        if (!user) {
            return NextResponse.json({ message: "user not found " }, { status: 400 })
        }
        if (user.isEmailVerified) {
            return NextResponse.json({ message: "user email already verified " }, { status: 400 })
        }

        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return NextResponse.json({ message: "otp expired" }, { status: 400 })
        }

        if (!user.otp || user.otp != otp) {
            return NextResponse.json(
                { message: "invalid otp" },
                { status: 400 }
            )
        }

        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;

        await user.save()

        return NextResponse.json(
            { message: "email is verified" },
            { status: 200 }
        )


    } catch (error) {
        return NextResponse.json(
            { message: `verify email error ${error}` },
            { status: 500 }
        )

    }
}