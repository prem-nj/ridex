'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import Image from 'next/image'
import {
  CheckCircle,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  X,
  XCircle,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { AnimatePresence, motion } from 'motion/react'

function Page() {
  const { userData } = useSelector((state: RootState) => state.user)

  const containerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLVideoElement>(null)

  const [joined, setJoined] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)

  const [loading, setLoading] = useState(false)
  const [aLoading, setALoading] = useState(false)
  const [rLoading, setRLoading] = useState(false)

  const [reason, setReason] = useState('')

  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)

  const router = useRouter()

  const params = useParams<{ roomId: string }>()
  const roomId = params?.roomId

  // --------------------------------------------------
  // DEBUG
  // --------------------------------------------------

  useEffect(() => {
    console.log('VIDEO KYC PAGE')
    console.log('ROOM ID:', roomId)
    console.log('USER DATA:', userData)
  }, [roomId, userData])

  // --------------------------------------------------
  // CAMERA PREVIEW
  // --------------------------------------------------

  useEffect(() => {
    let localStream: MediaStream | null = null

    const initCamera = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        setStream(localStream)

        if (previewRef.current) {
          previewRef.current.srcObject = localStream
        }
      } catch (error) {
        console.error('CAMERA/MIC ERROR:', error)
      }
    }

    if (!joined) {
      initCamera()
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [joined])

  // --------------------------------------------------
  // STOP LOCAL CAMERA WHEN PAGE IS CLOSED
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  // --------------------------------------------------
  // CAMERA TOGGLE
  // --------------------------------------------------

  const toggleCamera = () => {
    if (!stream) return

    const newCameraState = !isCameraOn

    stream.getVideoTracks().forEach((track) => {
      track.enabled = newCameraState
    })

    setIsCameraOn(newCameraState)
  }

  // --------------------------------------------------
  // MIC TOGGLE
  // --------------------------------------------------

  const toggleMic = () => {
    if (!stream) return

    const newMicState = !isMicOn

    stream.getAudioTracks().forEach((track) => {
      track.enabled = newMicState
    })

    setIsMicOn(newMicState)
  }

  // --------------------------------------------------
  // START ZEGO CALL
  // --------------------------------------------------

  const startCall = async () => {
    if (!containerRef.current) {
      console.error('Zego container is not ready')
      return
    }

    if (!roomId) {
      console.error('ROOM ID IS MISSING')
      return
    }

    if (!userData?._id) {
      console.error('USER DATA IS NOT LOADED')
      return
    }

    const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET

    if (!appId) {
      console.error('NEXT_PUBLIC_ZEGO_APP_ID is missing')
      return
    }

    if (!serverSecret) {
      console.error('NEXT_PUBLIC_ZEGO_SERVER_SECRET is missing')
      return
    }

    setLoading(true)

    try {
      const displayName =
        userData.role === 'admin'
          ? 'Admin'
          : `${userData.name || 'Partner'} (${userData.email || ''})`

      console.log('STARTING ZEGO CALL')
      console.log('ROOM ID:', roomId)
      console.log('USER ID:', userData._id)
      console.log('DISPLAY NAME:', displayName)

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        roomId,
        String(userData._id),
        displayName
      )

      const zp = ZegoUIKitPrebuilt.create(kitToken)

      zp.joinRoom({
        container: containerRef.current,

        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },

        showPreJoinView: false,
      })

      setJoined(true)

      // Camera preview is no longer needed.
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      setStream(null)
    } catch (error) {
      console.error('ZEGO JOIN ERROR:', error)
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // APPROVE KYC
  // --------------------------------------------------

  const handleApprove = async () => {
    if (!roomId) {
      console.error('ROOM ID IS MISSING')
      return
    }

    setALoading(true)

    try {
      const { data } = await axios.post(
        '/api/admin/video-kyc/complete',
        {
          roomId,
          action: 'approved',
        }
      )

      console.log('APPROVE RESPONSE:', data)

      setShowApprovalModal(false)

      router.push('/')
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'APPROVE ERROR:',
          error.response?.data || error.message
        )
      } else {
        console.error('APPROVE ERROR:', error)
      }
    } finally {
      setALoading(false)
    }
  }

  // --------------------------------------------------
  // REJECT KYC
  // --------------------------------------------------

  const handleReject = async () => {
    if (!roomId) {
      console.error('ROOM ID IS MISSING')
      return
    }

    if (!reason.trim()) {
      alert('Please enter rejection reason')
      return
    }

    setRLoading(true)

    try {
      const { data } = await axios.post(
        '/api/admin/video-kyc/complete',
        {
          roomId,
          action: 'rejected',
          reason: reason.trim(),
        }
      )

      console.log('REJECT RESPONSE:', data)

      setShowRejectionModal(false)

      router.push('/')
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'REJECT ERROR:',
          error.response?.data || error.message
        )
      } else {
        console.error('REJECT ERROR:', error)
      }
    } finally {
      setRLoading(false)
    }
  }

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-gray-400">
            Loading user...
          </p>
        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // MISSING ROOM ID
  // --------------------------------------------------

  if (!roomId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle
            size={50}
            className="text-red-500 mx-auto mb-4"
          />

          <h1 className="text-xl font-bold">
            Invalid Video KYC Room
          </h1>

          <p className="text-gray-400 mt-2">
            Room ID is missing.
          </p>

          <button
            onClick={() => router.push('/')}
            className="mt-6 bg-white text-black px-5 py-2.5 rounded-xl"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* HEADER */}

      <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <div>
          <Image
            src="/logo.png"
            alt="RideX"
            width={44}
            height={44}
            priority
          />

          <p className="text-xs text-gray-400 mt-1">
            {userData.role === 'admin'
              ? 'Admin Verification'
              : 'Partner Video KYC'}
          </p>
        </div>

        {joined && (
          <div className="flex flex-wrap gap-3">

            {/* ADMIN APPROVE / REJECT */}

            {userData.role === 'admin' && (
              <>
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm flex items-center gap-2"
                  onClick={() =>
                    setShowApprovalModal(true)
                  }
                >
                  <CheckCircle size={16} />
                  Approve
                </button>

                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm flex items-center gap-2"
                  onClick={() =>
                    setShowRejectionModal(true)
                  }
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </>
            )}

            {/* END CALL */}

            <button
              type="button"
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full text-sm flex items-center gap-2"
              onClick={() => router.push('/')}
            >
              <PhoneOff size={16} />
              End Call
            </button>
          </div>
        )}
      </div>

      {/* MAIN */}

      <div className="flex-1 relative">

        {/* ZEGO CONTAINER */}

        <div
          ref={containerRef}
          className={`absolute inset-0 ${
            joined ? 'block' : 'hidden'
          }`}
        />

        {/* PRE-JOIN SCREEN */}

        {!joined && (
          <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* CAMERA PREVIEW */}

              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">

                <video
                  ref={previewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-[300px] sm:h-[400px] object-cover"
                />

                {!isCameraOn && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <VideoOff size={40} />
                  </div>
                )}
              </div>

              {/* CONTROLS */}

              <div className="space-y-8 text-center lg:text-left">

                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">
                    Secure Video KYC
                  </h1>

                  <p className="text-gray-400 mt-3">
                    {userData.role === 'admin'
                      ? 'Join the partner verification call.'
                      : 'Join your secure verification call.'}
                  </p>
                </div>

                {/* CAMERA / MIC */}

                <div className="flex justify-center lg:justify-start gap-6">

                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                      isCameraOn
                        ? 'bg-white text-black'
                        : 'bg-white/10 border border-white/20'
                    }`}
                  >
                    {isCameraOn ? (
                      <Video />
                    ) : (
                      <VideoOff />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                      isMicOn
                        ? 'bg-white text-black'
                        : 'bg-white/10 border border-white/20'
                    }`}
                  >
                    {isMicOn ? (
                      <Mic />
                    ) : (
                      <MicOff />
                    )}
                  </button>

                </div>

                {/* JOIN */}

                <button
                  type="button"
                  onClick={startCall}
                  disabled={loading}
                  className="w-full bg-white text-black py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Connecting...'
                    : 'Join Secure Call'}
                </button>

                <p className="text-xs text-gray-500 break-all">
                  Room: {roomId}
                </p>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* APPROVAL MODAL */}

      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >

              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={() =>
                  setShowApprovalModal(false)
                }
              >
                <X size={16} />
              </button>

              <h2 className="text-lg font-semibold mb-2">
                Confirm Approval
              </h2>

              <p className="text-sm text-gray-400 mb-6">
                Are you sure you want to approve this partner's
                Video KYC?
              </p>

              <div className="flex gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowApprovalModal(false)
                  }
                  className="flex-1 border border-white/20 rounded-xl py-2 hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl py-2 disabled:opacity-50"
                  disabled={aLoading}
                  onClick={handleApprove}
                >
                  {aLoading
                    ? 'Processing...'
                    : 'Approve'}
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REJECTION MODAL */}

      <AnimatePresence>
        {showRejectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >

              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={() =>
                  setShowRejectionModal(false)
                }
              >
                <X size={16} />
              </button>

              <h2 className="text-lg font-semibold mb-2">
                Reject Partner
              </h2>

              <p className="text-sm text-gray-400 mb-4">
                Please provide a reason for rejecting the Video
                KYC.
              </p>

              <textarea
                placeholder="Give rejection reason"
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 mb-4 text-sm outline-none focus:border-white/40 min-h-[120px]"
              />

              <div className="flex gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowRejectionModal(false)
                  }
                  className="flex-1 border border-white/20 rounded-xl py-2 hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl py-2 disabled:opacity-50"
                  disabled={
                    rLoading || !reason.trim()
                  }
                  onClick={handleReject}
                >
                  {rLoading
                    ? 'Processing...'
                    : 'Reject'}
                </button>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Page