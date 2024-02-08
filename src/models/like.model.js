import mongoose from "mongoose"

const likeSchema = mongoose.Schema({
    likedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    comment:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    },
    tweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Tweet"
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }
},{timestamps:true});

export const Like = mongoose.model("Like",likeSchema);