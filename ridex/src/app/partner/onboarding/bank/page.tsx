'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  CircleDashed,
  CreditCard,
  Landmark,
  Phone,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/

function Page() {
  const router = useRouter()

  const [accountHolder, setAccountHolder] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [upi, setUpi] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sanitizedIfsc = ifsc.trim().toUpperCase()

  const isNameValid = accountHolder.trim().length >= 3
  const isAccountValid = accountNumber.trim().length >= 9
  const isIfscValid = IFSC_REGEX.test(sanitizedIfsc)
  const isMobileValid = /^[6-9]\d{9}$/.test(mobileNumber)

  const canSubmit =
    isNameValid &&
    isAccountValid &&
    isIfscValid &&
    isMobileValid

  const handleBank = async () => {
    if (!canSubmit) return

    setLoading(true)
    setError('')

    try {
      const { data } = await axios.post('/api/partner/onboarding/bank', {
        accountHolder,
        accountNumber,
        ifsc: sanitizedIfsc,
        upi,
        mobileNumber,
      })

      console.log(data)

      window.location.href = '/'
    } catch (error: any) {
      console.log(error)
      setError(error?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleGetBank = async () => {
      try {
        const { data } = await axios.get('/api/partner/onboarding/bank')

        console.log(data)

        setAccountHolder(data?.partnerBank?.accountHolder || '')
        setAccountNumber(data?.partnerBank?.accountNumber || '')
        setIfsc(data?.partnerBank?.ifsc || '')
        setMobileNumber(data?.partnerBank?.mobileNumber || '')
        setUpi(data?.partnerBank?.upi || '')
      } catch (error) {
        console.log(error)
      }
    }

    handleGetBank()
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
      >
        <div className="relative text-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <p className="text-xs text-gray-500 font-medium">Step 3 of 3</p>

          <h1 className="text-2xl font-bold mt-1">
            Bank & Payout Setup
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Used for partner payouts
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Account Holder */}
          <div>
            <label
              htmlFor="accountHolder"
              className="text-xs font-semibold text-gray-500"
            >
              Account holder name
            </label>

            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <BadgeCheck />
              </div>

              <input
                id="accountHolder"
                type="text"
                placeholder="As per bank records"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${
                  !isNameValid && accountHolder.length > 0
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-300 focus:border-black'
                }`}
              />
            </div>

            {!isNameValid && accountHolder.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Minimum 3 characters required
              </p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label
              htmlFor="accountNumber"
              className="text-xs font-semibold text-gray-500"
            >
              Bank account number
            </label>

            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <CreditCard />
              </div>

              <input
                id="accountNumber"
                type="text"
                inputMode="numeric"
                maxLength={18}
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(
                    e.target.value.replace(/\D/g, '')
                  )
                }
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${
                  !isAccountValid && accountNumber.length > 0
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-300 focus:border-black'
                }`}
              />
            </div>

            {!isAccountValid && accountNumber.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Account number must be at least 9 digits
              </p>
            )}
          </div>

          {/* IFSC */}
          <div>
            <label
              htmlFor="ifsc"
              className="text-xs font-semibold text-gray-500"
            >
              IFSC code
            </label>

            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <Landmark />
              </div>

              <input
                id="ifsc"
                type="text"
                maxLength={11}
                placeholder="HDFC0001234"
                value={ifsc.toUpperCase()}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${
                  !isIfscValid && ifsc.length > 0
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-300 focus:border-black'
                }`}
              />
            </div>

            {!isIfscValid && ifsc.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Invalid IFSC code
              </p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label
              htmlFor="mobile"
              className="text-xs font-semibold text-gray-500"
            >
              Mobile number
            </label>

            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <Phone />
              </div>

              <input
                id="mobile"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="10 digit mobile number"
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(
                    e.target.value.replace(/\D/g, '')
                  )
                }
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${
                  !isMobileValid && mobileNumber.length > 0
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-300 focus:border-black'
                }`}
              />
            </div>

            {!isMobileValid && mobileNumber.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Enter a valid 10-digit mobile number
              </p>
            )}
          </div>

          {/* UPI */}
          <div>
            <label
              htmlFor="upi"
              className="text-xs font-semibold text-gray-500"
            >
              UPI ID (optional)
            </label>

            <div className="mt-2">
              <input
                id="upi"
                type="text"
                placeholder="name@upi"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
                className="w-full border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-500 mt-4 text-sm">
            * {error}
          </p>
        )}

        <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
          <CheckCircle size={16} className="mt-0.5" />
          <p>
            Bank details are verified before the first payout.
            This usually takes 24–48 hours.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBank}
          disabled={!canSubmit || loading}
          className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold disabled:opacity-40 transition flex items-center justify-center"
        >
          {loading ? (
            <CircleDashed className="animate-spin" />
          ) : (
            'Continue'
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Page