import { auth } from "@/auth"
import connectDb from "@/lib/db"
import Booking from "@/models/booking.model"
import User from "@/models/user.model"
import Vehicle from "@/models/vehicle.model"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        await connectDb()

        const session = await auth()

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { message: "unauthorized" },
                { status: 401 }
            )
        }

        const user = await User.findOne({
            email: session.user.email
        })

        if (!user) {
            return NextResponse.json(
                { message: "partner user not found" },
                { status: 404 }
            )
        }

        const booking = await Booking.findOne({
            driver: user._id,
            bookingStatus: {
                $in: ["confirmed", "started"]
            }
        }).populate("user vehicle driver")

        return NextResponse.json(
            booking,
            { status: 200 }
        )

    } catch (error) {
        console.error("GET ACTIVE RIDE FOR PARTNER ERROR:", error)

        return NextResponse.json(
            {
                message: "get active ride for partner error",
                error: error instanceof Error
                    ? error.message
                    : String(error)
            },
            { status: 500 }
        )
    }
}