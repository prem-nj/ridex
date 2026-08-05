"use client";
import { signOut } from "next-auth/react";
import React from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ContentListProps = {
  data: any[];
  type: "partner" | "vehicle" | "kyc";
};

function ContentList({
  data,
  type,
}: ContentListProps) {
  const router = useRouter();

  console.log("CONTENT LIST:", {
    type,
    data,
  });

  // ---------------------------------------
  // EMPTY STATE
  // ---------------------------------------

  if (!data || data.length === 0) {
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

  // ---------------------------------------
  // TITLE
  // ---------------------------------------

  const queueTitle =
    type === "partner"
      ? "Partner Reviews Queue"
      : type === "vehicle"
        ? "Vehicle Reviews Queue"
        : "Reviews Queue";

  // ---------------------------------------
  // REVIEW HANDLER
  // ---------------------------------------

  const handleReview = (item: any) => {
    console.log("================================");
    console.log("REVIEW BUTTON CLICKED");
    console.log("TYPE:", type);
    console.log("ITEM:", item);
    console.log("ITEM ID:", item?._id);
    console.log("================================");

    if (!item?._id) {
      console.error(
        "ERROR: item._id is missing",
        item
      );
      return;
    }

    const id = item._id.toString();

    if (type === "partner") {
      const url = `/admin/reviews/partner/${id}`;

      console.log("NAVIGATING:", url);

      router.push(url);

      return;
    }

    if (type === "vehicle") {
      const url = `/admin/reviews/vehicle/${id}`;

      console.log("NAVIGATING:", url);

      router.push(url);

      return;
    }

    // IMPORTANT
    if (type === "kyc") {
      console.error(
        "TYPE IS KYC. No partner/vehicle route was configured."
      );

      return;
    }

    console.error(
      "UNKNOWN TYPE:",
      type
    );
  };

  // ---------------------------------------
  // CONTENT
  // ---------------------------------------

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

      {/* LIST */}
      {data.map(
        (item: any, index: number) => {
          const name =
            item?.name ||
            item?.owner?.name ||
            "Unknown User";

          const email =
            item?.email ||
            item?.owner?.email ||
            "";

          const firstLetter =
            name
              ?.charAt(0)
              ?.toUpperCase() || "U";

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
              className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
            >

              {/* USER INFO */}

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-bold text-purple-800">
                  {firstLetter}
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-bold text-gray-900">
                    {name}
                  </p>

                  {email && (
                    <p className="truncate text-xs text-gray-400">
                      {email}
                    </p>
                  )}

                  {item?.vehicleType && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      Vehicle:{" "}
                      {item.vehicleType}
                    </p>
                  )}

                </div>
              </div>

              {/* REVIEW BUTTON */}

              <div className="shrink-0">

                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.96,
                  }}
                  className="flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                  onClick={() =>
                    handleReview(item)
                  }
                >
                  Review

                  <ArrowRight
                    size={15}
                  />
                </motion.button>

              </div>
              
              <button onClick={() => signOut({ callbackUrl: "/login" })}>
                Logout
              </button>
            </motion.div>
          );
        }
      )}
    </div>
  );
}

export default ContentList;