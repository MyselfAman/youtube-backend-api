import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = mongoose.Schema({
    videoFile:{ // url of video cloudinary
        type:String,
        required:true
    },
    thumbnail:{ //  url of thumbnail cloudinary
        type:String,
        required:true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:String
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean
    }
},{timestamps:true});

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);