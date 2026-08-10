import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { emitToUser } from "@/lib/socketServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    console.log("BOOKING BODY:", JSON.stringify(body, null, 2));

    const {
      driverId,
      vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      mobileNumber,
    } = body;

    if (!driverId) {
      return NextResponse.json(
        { message: "driverId is missing" },
        { status: 400 }
      );
    }

    if (!vehicleId) {
      return NextResponse.json(
        { message: "vehicleId is missing" },
        { status: 400 }
      );
    }

    if (!pickUpLocation?.coordinates) {
      return NextResponse.json(
        { message: "pickup coordinates are missing" },
        { status: 400 }
      );
    }

    if (!dropLocation?.coordinates) {
      return NextResponse.json(
        { message: "drop coordinates are missing" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { message: "user not found" },
        { status: 404 }
      );
    }

    const driver = await User.findById(driverId);

    if (!driver) {
      return NextResponse.json(
        { message: "driver not found" },
        { status: 400 }
      );
    }

    const existing = await Booking.findOne({
      user: user._id,
      bookingStatus: {
        $in: [
          "requested",
          "awaiting_payment",
          "confirmed",
          "started",
        ],
      },
    });

    if (existing) {
      return NextResponse.json(existing, {
        status: 200,
      });
    }

    const booking = await Booking.create({
      user: user._id,
      driver: driver._id,
      vehicle: vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      userMobileNumber: mobileNumber,
      driverMobileNumber: driver.mobileNumber,
      bookingStatus: "requested",
    });

    console.log("BOOKING CREATED:", booking._id);

    await emitToUser("new-booking", driverId, booking);

    return NextResponse.json(booking, {
      status: 200,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    return NextResponse.json(
      {
        message: `create booking error ${error}`,
      },
      {
        status: 500,
      }
    );
  }
}