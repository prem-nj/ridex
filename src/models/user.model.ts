import mongoose, { Document } from "mongoose";
export interface Iuser extends Document {
    name: string,
    email: string,
    password?: string,
    role: "user" | "partner" | "admin",
    createdAt: Date,
    isEmailVerified?: boolean
    otp?: string,
    otpExpiresAt?: Date
partnerOnBoardingSteps:number
    updatedAt: Date,
}

const userSchema = new mongoose.Schema<Iuser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "partner", "admin"]
    },
    otp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    
    partnerOnBoardingSteps:{
    type:Number,
    min:0,
    max:8,
    default:0
},


}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User