'use client'

import { IVehicle } from '@/models/vehicle.model'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ImagePlus, IndianRupee } from 'lucide-react'
import axios from 'axios'

type PropsType = {
  open: boolean
  onClose: () => void
  data: IVehicle | null
}

function PricingModal({ open, onClose, data }: PropsType) {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [baseFare, setBaseFare] = useState('')
  const [pricePerKM, setPricePerKM] = useState('')
  const [waitingCharge, setWaitingCharge] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (data) {
      setPreview(data.imageUrl || null)
      setBaseFare(data.baseFare?.toString() || '')
      setPricePerKM(data.pricePerKM?.toString() || '')
      setWaitingCharge(data.waitingCharge?.toString() || '')
    }
  }, [data])

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const formData = new FormData()

      formData.append('baseFare', baseFare)
      formData.append('pricePerKM', pricePerKM)
      formData.append('waitingCharge', waitingCharge)

      if (image) {
        formData.append('image', image)
      }

      const response = await axios.post(
        '/api/partner/onboarding/pricing',
        formData
      )

      console.log(response.data)

      onClose()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data?.message ?? error.message)
      } else {
        console.log(error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="border-b p-6">
              <h2 className="text-xl font-bold">
                Pricing and Vehicle Image
              </h2>
            </div>

            <div className="space-y-6 p-6">
              <label
                htmlFor="imageLabel"
                className="relative flex h-44 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed"
              >
                {!preview ? (
                  <ImagePlus size={28} />
                ) : (
                  <img
                    src={preview}
                    alt="Vehicle preview"
                    className="absolute inset-0 h-full w-full rounded-2xl object-cover"
                  />
                )}

                <input
                  id="imageLabel"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0]

                    if (file) {
                      setImage(file)
                      setPreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </label>

              <div>
                <p className="mb-1 text-sm font-semibold">Base Fare</p>

                <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3">
                  <IndianRupee size={18} />

                  <input
                    type="text"
                    placeholder="Base Fare"
                    value={baseFare}
                    onChange={(e) => setBaseFare(e.target.value)}
                    className="w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold">Price Per KM</p>

                <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3">
                  <IndianRupee size={18} />

                  <input
                    type="text"
                    placeholder="Price Per KM"
                    value={pricePerKM}
                    onChange={(e) => setPricePerKM(e.target.value)}
                    className="w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold">
                  Waiting Charge
                </p>

                <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3">
                  <IndianRupee size={18} />

                  <input
                    type="text"
                    placeholder="Waiting Charge"
                    value={waitingCharge}
                    onChange={(e) => setWaitingCharge(e.target.value)}
                    className="w-full outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t p-6">
              <button
                className="flex-1 rounded-xl border py-2"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="flex-1 rounded-xl bg-black py-2 text-white disabled:opacity-50"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PricingModal