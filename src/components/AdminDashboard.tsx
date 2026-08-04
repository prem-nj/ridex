'use client'

import axios from 'axios'
import { CheckCircle2, Clock, Settings, Truck, User, Users, Video, XCircle } from 'lucide-react'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Kpi from './Kpi'
import TabButton from './TabButton'
import ContentList from './ContentList'
// import AdminEarning from './AdminEarning'

type Stats = {
  totalApprovedPartners: number
  totalPartners: number
  totalPendingPartners: number
  totalRejectedPartners: number
}

type Tab = 'partner' | 'vehicle' | 'kyc' | 'earning'

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('partner')

  const [partnerReviews, setPartnerReviews] = useState<any[]>([])
    const [pendingkyc, setPendingkyc] = useState<any>()
  const [vehicleReviews, setVehicleReviews] = useState<any[]>([])

  const handleGetData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard")
  
      console.log("DASHBOARD API:", data)
  
      setStats(data.stats)
      setPartnerReviews(data.pendingPartnersReviews || [])
      setVehicleReviews(data.pendingVehicles || [])
      setPendingkyc(data.pendingKyc || [])
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("STATUS:", error.response?.status)
        console.log("API ERROR:", error.response?.data)
        console.log("API HEADERS:", error.response?.headers)
      } else {
        console.log("UNKNOWN ERROR:", error)
      }
    }
  }

  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     try {
  //       // Replace these URLs with your actual API routes
  //       const [
  //         statsRes,
  //         partnerRes,
  //         vehicleRes,
  //         kycRes,
  //       ] = await Promise.all([
  //         axios.get('/api/admin/dashboard/stats'),
  //         axios.get('/api/admin/partners/reviews'),
  //         axios.get('/api/admin/vehicles/reviews'),
  //         axios.get('/api/admin/kyc/pending'),
  //       ])

  //       setStats(statsRes.data)
  //       setPartnerReviews(partnerRes.data || [])
  //       setVehicleReviews(vehicleRes.data || [])
  //       setPendingKyc(kycRes.data || [])
  //     } catch (error) {
  //       console.error('Failed to load dashboard:', error)
  //     }
  //   }

  //   fetchDashboardData()
  // }, [])
  //


  
  useEffect(() => {
    // handleGetPendingKYC()
    handleGetData()
  }, [])
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
    
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={44}
              height={44}
              priority
              className="rounded-full object-cover"
            />
          </div>

          <div className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs text-white">
            <User size={14} />
            Admin Dashboard
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-12">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Kpi
            label="Total Partners"
            value={stats?.totalPartners ?? 0}
            icon={<Users />}
            variant="totalPartners"
          />

          <Kpi
            label="Approved Partners"
            value={stats?.totalApprovedPartners ?? 0}
            icon={<CheckCircle2 />}
            variant="approved"
          />

          <Kpi
            label="Pending Partners"
            value={stats?.totalPendingPartners ?? 0}
            icon={<Clock />}
            variant="pending"
          />

          <Kpi
            label="Rejected Partners"
            value={stats?.totalRejectedPartners ?? 0}
            icon={<XCircle />}
            variant="rejected"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <TabButton
            active={activeTab === 'partner'}
            icon={<Users size={15} />}
           count={partnerReviews?.length ?? 0}
            onClick={() => setActiveTab('partner')}
          >
            Partner Review
          </TabButton>

          <TabButton
            active={activeTab === 'vehicle'}
            count={pendingkyc?.length ?? 0}
            icon={<Truck size={15} />}
            onClick={() => setActiveTab('vehicle')}
          >
            Vehicle Review
          </TabButton>

          <TabButton
            active={activeTab === 'kyc'}
            onClick={() => setActiveTab('kyc')}
            count={vehicleReviews?.length ?? 0}
             icon={<Video size={15} />}
          >
            Pending KYC
          </TabButton>

          <TabButton
            active={activeTab === 'earning'}
            onClick={() => setActiveTab('earning')}
               icon={<XCircle size={15} />}
          >
            Earnings
          </TabButton>
        </div>

        
        {activeTab === 'partner' && (
          <ContentList data={partnerReviews} type={"partner"} />
        )}

        {activeTab === 'vehicle' && (
          <ContentList data={vehicleReviews} type={"vehicle"} />
        )}

        {activeTab === 'kyc' && (
          <ContentList data={pendingKyc}  type={"kyc"}/>
        )}

        {activeTab === 'earning' && <AdminEarning />}
      </main>
    </div>
  )
}

export default AdminDashboard