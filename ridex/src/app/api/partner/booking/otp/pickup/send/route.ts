
import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        console.log("1. Starting pickup OTP");

        await connectDb();
        console.log("2. Database connected");

        const { bookingId } = await req.json();
        console.log("3. Booking ID:", bookingId);

        const booking = await Booking.findById(bookingId).populate("user");
        console.log("4. Booking found:", !!booking);

        if (!booking) {
            return NextResponse.json(
                { message: "booking not found" },
                { status: 400 }
            );
        }

        console.log("5. User:", booking.user);

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        booking.pickUpOtp = otp;
        booking.pickUpOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

        await booking.save();
        console.log("6. Booking saved");

        if (booking.user?.email) {
            console.log("7. Sending email to:", booking.user.email);

            await sendMail(
                booking.user.email,
                "Your Pickup OTP - RYDEX",
                `
                <div style="font-family:sans-serif;padding:20px">
                    <h2>Ride OTP</h2>
                    <p>Your pickup OTP is:</p>
                    <h1 style="letter-spacing:6px">${otp}</h1>
                    <p>This OTP is valid for 5 minutes.</p>
                    <p>Share this OTP with your driver to start the ride.</p>
                    <br/>
                    <b>RYDEX</b>
                </div>
                `
            );

            console.log("8. Email sent");
        } else {
            console.log("7. No user email found");
        }

        return NextResponse.json(
            { message: "pick up otp sent" },
            { status: 200 }
        );

    } catch (error) {
        console.error("========== PICKUP OTP ERROR ==========");
        console.error(error);
        console.error("======================================");

        return NextResponse.json(
            {
                message: "pick up otp error",
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}