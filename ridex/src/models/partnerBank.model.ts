import mongoose from "mongoose"

// 1. Export the interface so it can be imported as a TypeScript type
export interface IPartnerBank {
  owner: mongoose.Types.ObjectId
  accountHolder: string
  accountNumber: string
  ifsc: string
  upi?: string
  status: "not_added" | "added" | "verified"
  createdAt: Date
  updatedAt: Date
}

const partnerBankSchema = new mongoose.Schema<IPartnerBank>({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  accountHolder: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  ifsc: {
    type: String,
    required: true,
    uppercase: true
  },
  upi: String,
  status: {
    type: String,
    enum: ["not_added", "added", "verified"],
    default: "not_added"
  }
}, { timestamps: true })

const PartnerBank = mongoose.models.PartnerBank || mongoose.model<IPartnerBank>("PartnerBank", partnerBankSchema)

// 2. Default export remains the Mongoose Model
export default PartnerBank