import mongoose from "mongoose"

const commentSchema = mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    content:{
        type:String,
        required:true
    }
},{timestamps:true});

export const Comment = mongoose.model("Comment",commentSchema);