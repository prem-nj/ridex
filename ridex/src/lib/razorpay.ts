import Razorpay from "razorpay";

let razorpay: Razorpay | null = null

// Created lazily: instantiating at module scope makes the build fail when the
// keys are not present in the build environment.
const getRazorpay = () => {
    if (!razorpay) {
        const key_id = process.env.RAZORPAY_KEY_ID
        const key_secret = process.env.RAZORPAY_KEY_SECRET

        if (!key_id || !key_secret) {
            throw new Error("razorpay keys are not configured")
        }

        razorpay = new Razorpay({ key_id, key_secret })
    }

    return razorpay
}

export default getRazorpay
