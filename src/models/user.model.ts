import mongoose, { Document } from "mongoose";

interface Iuser extends Document{
    name:string,
    email:string,
    password?:string,
    role:"user"|"partner"|"admin",
    createdAt:Date,
    updatedAt:Date,
}

const userSchema=new mongoose.Schema<Iuser>({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true        
    },
    role:{
        type:String,
        default:"user",
        enum:["user","partner","admin"]
    }

},{timestamps:true})

const User= mongoose.models.User || mongoose.model("User",userSchema)

export default User