"use client";


import AnimatedCard from '@/components/AnimatedCard'
import DocPreview from '@/components/DocPreview'
import { IPartnerBank } from '@/models/partnerBank.model'
import { IPartnerDocs } from '@/models/partnerDocs.model'
import { IUser } from '@/models/user.model'
import { IVehicle } from '@/models/vehicle.model'
import axios from 'axios'
import { url } from 'inspector'
import { ArrowLeft, Car, CheckCircle, CircleDashed, Clock, FileText, Landmark, ShieldCheck, XCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"

function Page() {

  const { id } = useParams()
  const [data, setData] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [vehicleDetails, setVehicleDetails] = useState<IVehicle | null>(null)
  const [partnerDocs, setPartnerDocs] = useState<IPartnerDocs | null>(null)
  const [partnerBank, setPartnerBank] = useState<IPartnerBank | null>(null)
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [rejectionReason,setRejectionReason]=useState("")
  const [approveLoading,setApproveLoading]=useState(false)
    const [rejectLoading,setRejectLoading]=useState(false)
  const router = useRouter()
  
  useEffect(() => {
    if (!id) {
      console.log("NO ID FOUND");
      return;
    }

    const getPartner = async () => {
      try {
        console.log("FETCHING PARTNER:", id);

        const {data}= await axios.get(
          `/api/admin/reviews/partner/${id}`
        );

        setData(data.partner)
        setVehicleDetails(data.vehicle)
        setPartnerDocs(data.documents)
        setPartnerBank(data.bank)
        setLoading(false)
     
      } catch (error: any) {
        console.error("PARTNER API ERROR:", error);

        

      } finally {
        setLoading(false);
      }
    };

    getPartner();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading partner...</p>
      </div>
    );
  }


  return (
    <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200'>
        <div className='sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b'>
            <div className='max-w-7xl mx-auto px-4 h-16 flex items-center gap-4'>
                <button className='w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition' onClick={() => router.back()}>
                    <ArrowLeft size={18} />
                </button>
                <div className='flex-1'>
                    <div className='font-semibold text-lg'>{data?.name}</div>
                    <div className='text-xs text-gray-500'>{data?.email}</div>
                </div>
                {
                    data?.partnerStatus === "approved" ? (
                        <div className='px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-green-100 text-green-700'>
                            <CheckCircle size={14} />
                            Approved
                        </div>
                    ) : data?.partnerStatus === "rejected" ? (
                        <div className='px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-red-100 text-red-700'>
                            <XCircle size={14} />
                            Rejected
                        </div>
                    ) : (
                        <div className='px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-yellow-100 text-yellow-700'>
                            <Clock size={14} />
                            Pending
                        </div>
                    )
                }
            </div>
        </div>
    </div>
  );
}

export default Page;