

"use client";

import React from "react";
import { motion } from "motion/react";
import {
    ArrowRight,
    CheckCircle2,
    User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

type ContentListProps = {
    data?: any[];
    type: "partner" | "vehicle" | "kyc";
};

function ContentList({
    data = [],
    type,
}: ContentListProps) {
    const router = useRouter();

    console.log("CONTENT LIST:", {
        type,
        data,
    });



    const handleStartVideoKyc = async (id: string) => {
        try {
            await axios.get(
                `/api/admin/video-kyc/start/${id}`
            );

            window.location.reload();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "VIDEO KYC ERROR:",
                    error.response?.data
                );
            } else {
                console.error(
                    "VIDEO KYC ERROR:",
                    error
                );
            }
        }
    };

    // ----------------------------------------
    // EMPTY STATE
    // ----------------------------------------

    if (data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-sm"
            >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                    <CheckCircle2
                        size={22}
                        className="text-green-400"
                    />
                </div>

                <p className="text-base font-bold text-gray-800">
                    All caught up!
                </p>

                <p className="mt-1 text-sm text-gray-400">
                    No pending items right now.
                </p>
            </motion.div>
        );
    }

    // ----------------------------------------
    // QUEUE TITLE
    // ----------------------------------------

    const queueTitle =
        type === "partner"
            ? "Partner Reviews Queue"
            : type === "kyc"
              ? "Pending Video KYC Queue"
              : "Vehicle Reviews Queue";

    // ----------------------------------------
    // LIST
    // ----------------------------------------

    return (
        <div className="space-y-3">

            {/* HEADER */}
            <div className="mb-1 flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {queueTitle}
                </p>

                <p className="text-xs text-gray-400">
                    {data.length}{" "}
                    {data.length === 1
                        ? "item"
                        : "items"}
                </p>
            </div>

            {/* ITEMS */}
            {data.map((item: any, index: number) => {

                // --------------------------------
                // SAFE USER DATA
                // --------------------------------

                const name =
                    item?.name ||
                    item?.owner?.name ||
                    "Unknown User";

                const email =
                    item?.email ||
                    item?.owner?.email ||
                    "";

                const firstLetter =
                    name?.charAt(0)?.toUpperCase() ||
                    "U";

                return (
                    <motion.div
                        key={
                            item?._id?.toString() ||
                            index
                        }
                        initial={{
                            opacity: 0,
                            y: 10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: index * 0.05,
                        }}
                        whileHover={{
                            y: -3,
                            boxShadow:
                                "0 8px 30px rgba(0,0,0,0.08)",
                        }}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow"
                    >

                        {/* USER / PARTNER INFO */}
                        <div className="flex min-w-0 items-center gap-3">

                            {/* AVATAR */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-bold text-purple-800">
                                {firstLetter || (
                                    <User size={14} />
                                )}
                            </div>

                            {/* NAME + EMAIL */}
                            <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-gray-900">
                                    {name}
                                </p>

                                {email && (
                                    <p className="truncate text-xs text-gray-400">
                                        {email}
                                    </p>
                                )}

                                {/* VEHICLE TYPE */}
                                {item?.vehicleType && (
                                    <p className="mt-1 text-xs text-gray-400">
                                        Vehicle:{" "}
                                        {item.vehicleType}
                                    </p>
                                )}

                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="shrink-0">

                            {/* -------------------------------- */}
                            {/* VIDEO KYC PENDING */}
                            {/* -------------------------------- */}

                            {type === "kyc" &&
                            item?.videoKycStatus ===
                                "pending" ? (
                                <motion.button
                                    type="button"
                                    whileTap={{
                                        scale: 0.96,
                                    }}
                                    className="flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                                    onClick={() =>
                                        handleStartVideoKyc(
                                            item._id
                                        )
                                    }
                                >
                                    Start Video KYC
                                    <ArrowRight
                                        size={15}
                                    />
                                </motion.button>
                            ) : /* -------------------------------- */
                            /* VIDEO KYC IN PROGRESS */
                            /* -------------------------------- */

                            type === "kyc" &&
                            item?.videoKycStatus ===
                                "in_progress" ? (
                                <motion.button
                                    type="button"
                                    whileTap={{
                                        scale: 0.96,
                                    }}
                                    disabled={
                                        !item?.videoKycRoomId
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => {
                                        if (
                                            item?.videoKycRoomId
                                        ) {
                                            router.push(
                                                `/video-kyc/${item.videoKycRoomId}`
                                            );
                                        }
                                    }}
                                >
                                    Join Call
                                    <ArrowRight
                                        size={15}
                                    />
                                </motion.button>
                            ) : /* -------------------------------- */
                            /* PARTNER / VEHICLE REVIEW */
                            /* -------------------------------- */

                            (
                                <motion.button
                                    type="button"
                                    whileTap={{
                                        scale: 0.96,
                                    }}
                                    className="flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                                    onClick={() => {
                                        if (
                                            type ===
                                            "partner"
                                        ) {
                                            router.push(
                                                `/admin/reviews/partner/${item._id}`
                                            );
                                        }

                                        if (
                                            type ===
                                            "vehicle"
                                        ) {
                                            router.push(
                                                `/admin/reviews/vehicle/${item._id}`
                                            );
                                        }
                                    }}
                                >
                                    Review
                                    <ArrowRight
                                        size={15}
                                    />
                                </motion.button>
                            )}

                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

export default ContentList;
