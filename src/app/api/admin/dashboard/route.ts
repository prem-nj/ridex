import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // --------------------------------
        // DATABASE
        // --------------------------------

        await connectDb();

        // --------------------------------
        // AUTH
        // --------------------------------

        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        // Get actual user from database
        const adminUser = await User.findOne({
            email: session.user.email,
        }).lean();

        // Check admin role from database
        if (!adminUser || adminUser.role !== "admin") {
            return NextResponse.json(
                {
                    message: "Forbidden",
                },
                {
                    status: 403,
                }
            );
        }

        // --------------------------------
        // PARTNER STATS
        // --------------------------------

        const totalPartners = await User.countDocuments({
            role: "partner",
        });

        const totalApprovedPartners =
            await User.countDocuments({
                role: "partner",
                partnerStatus: "approved",
            });

        const totalPendingPartners =
            await User.countDocuments({
                role: "partner",
                partnerStatus: "pending",
            });

        const totalRejectedPartners =
            await User.countDocuments({
                role: "partner",
                partnerStatus: "rejected",
            });

        // --------------------------------
        // PENDING PARTNER REVIEWS
        // --------------------------------

        const pendingPartnerUsers =
            await User.find({
                role: "partner",
                partnerStatus: "pending",
                partnerOnBoardingSteps: {
                    $gte: 3,
                },
            }).lean();

        console.log(
            "PENDING PARTNER USERS:",
            pendingPartnerUsers
        );

        const partnerIds =
            pendingPartnerUsers.map(
                (partner) => partner._id
            );

        const partnerVehicles =
            await Vehicle.find({
                owner: {
                    $in: partnerIds,
                },
            }).lean();

        const vehicleTypeMap = new Map(
            partnerVehicles.map((vehicle) => [
                String(vehicle.owner),
                vehicle.type,
            ])
        );

        const pendingPartnersReviews =
            pendingPartnerUsers.map(
                (partner) => ({
                    _id: partner._id,
                    name: partner.name,
                    email: partner.email,
                    vehicleType:
                        vehicleTypeMap.get(
                            String(partner._id)
                        ),
                })
            );

        // --------------------------------
        // PENDING VEHICLE REVIEWS
        // --------------------------------

        const pendingVehicles =
            await Vehicle.find({
                status: "pending",
                baseFare: {
                    $exists: true,
                },
                pricePerKM: {
                    $exists: true,
                },
            })
                .populate("owner")
                .lean();

        console.log(
            "PENDING VEHICLES:",
            pendingVehicles
        );

        // --------------------------------
        // PENDING VIDEO KYC
        // --------------------------------

        const pendingKyc =
            await User.find({
                role: "partner",

                partnerOnBoardingSteps: 4,

                videoKycStatus: {
                    $in: [
                        "pending",
                        "in_progress",
                    ],
                },
            }).lean();

        console.log(
            "PENDING KYC FROM DASHBOARD:",
            pendingKyc
        );

        // --------------------------------
        // RESPONSE
        // --------------------------------

        return NextResponse.json(
            {
                stats: {
                    totalPartners,
                    totalApprovedPartners,
                    totalPendingPartners,
                    totalRejectedPartners,
                },

                pendingPartnersReviews,

                pendingVehicles,

                pendingKyc,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "ADMIN DASHBOARD ERROR:",
            error
        );

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            {
                status: 500,
            }
        );
    }
}