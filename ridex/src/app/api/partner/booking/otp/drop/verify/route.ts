import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { bookingId, otp } = await req.json();

    const booking = await Booking.findById(bookingId).populate("user");

    if (!booking) {
      return NextResponse.json(
        { message: "booking not found" },
        { status: 400 }
      );
    }

    if (!booking.dropOtp) {
      return NextResponse.json(
        { message: "drop otp not generated" },
        { status: 400 }
      );
    }

    if (booking.dropOtp !== otp) {
      return NextResponse.json(
        { message: "incorrect drop otp" },
        { status: 400 }
      );
    }

    if (
      booking.dropOtpExpires &&
      booking.dropOtpExpires < new Date()
    ) {
      return NextResponse.json(
        { message: "otp expired" },
        { status: 400 }
      );
    }

    // Calculate partner/admin amount for cash rides
    if (booking.paymentStatus === "cash") {
      const adminCommission = booking.fare * 0.10;
      const partnerAmount = booking.fare - adminCommission;

      booking.adminCommission = adminCommission;
      booking.partnerAmount = partnerAmount;
    }

    // Complete the ride
    booking.paymentStatus = "paid";
    booking.bookingStatus = "completed";
    booking.dropOtp = "";
    booking.dropOtpExpires = undefined;

    // Save booking first
    await booking.save();

    console.log(" Booking completed:", booking._id.toString());
    console.log(" User:", booking.user._id.toString());

    // Notify user through Socket.IO
    try {
      if (!process.env.SOCKET_SERVER_URL) {
        console.error("❌ SOCKET_SERVER_URL is not defined");
      } else {
        await axios.post(
          `${process.env.SOCKET_SERVER_URL}/emit`,
          {
            event: "ride-completed",

            userId: booking.user._id.toString(),

            data: {
              bookingId: booking._id.toString(),
              bookingStatus: "completed",
              paymentStatus: "paid",
              fare: booking.fare,
            },
          },
          {
            timeout: 5000,
          }
        );

        console.log(" ride-completed event sent to user");
      }
    } catch (socketError) {
      // Do not fail the ride completion if socket notification fails
      console.error(
        "❌ Failed to send ride-completed event:",
        socketError
      );
    }

    return NextResponse.json(
      {
        message: "drop otp verified",
        bookingId: booking._id.toString(),
        userId: booking.user._id.toString(),
        bookingStatus: "completed",
        paymentStatus: "paid",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(" DROP OTP VERIFY ERROR:", error);

    return NextResponse.json(
      {
        message: "drop otp verify error",
      },
      { status: 500 }
    );
  }
}