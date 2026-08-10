import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";

import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { booking: null },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { booking: null },
        { status: 404 }
      );
    }

    const booking = await Booking.findOne({
      user: user._id,
      bookingStatus: {
        $in: [
          "requested",
          "awaiting_payment",
          "confirmed",
          "started",
        ],
      },
    })
      .populate("driver")
      .populate("vehicle")
      .sort({ createdAt: -1 });

    if (!booking) {
      return NextResponse.json({
        booking: null,
      });
    }

    return NextResponse.json({
      booking,
    });

  } catch (error) {
    console.error("GET ACTIVE BOOKING ERROR:", error);

    return NextResponse.json(
      {
        message: `get active booking error ${error}`,
      },
      {
        status: 500,
      }
    );
  }
}