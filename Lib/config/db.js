import mongoose from "mongoose";

export const ConnectDB = async()=>{
    await mongoose.connect('mongodb+srv://sossumi:<wv53rW8fwO0Ysv5u>@cluster0.8yfsgki.mongodb.net/sosumi-blog')
    console.log("DB Connected")
}