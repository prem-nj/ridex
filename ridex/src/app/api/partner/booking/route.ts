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

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "unauthorized" },
        { status: 401 }
      );
    }

    const driver = await User.findOne({
      email: session.user.email,
    });

    if (!driver) {
      return NextResponse.json(
        { message: "Driver not found" },
        { status: 404 }
      );
    }

    const bookings = await Booking.find({
      driver: driver._id,
    })
      .populate("user")
      .populate("driver")
      .populate({
        path: "vehicle",
        model: Vehicle,
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(bookings, {
      status: 200,
    });
  } catch (error) {
    console.error("GET PARTNER BOOKINGS ERROR:", error);

    return NextResponse.json(
      {
        message: `get bookings for partner error ${error}`,
      },
      { status: 500 }
    );
  }
}