import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId) throw new ApiError(400,"Please provide video id")
    const video = await Video.findById(videoId);

    if(!video) throw new ApiError(400,"Please provide valid video id");

    Like.findByIdAndUpdate({likedBy: req.user._id},{
        $set:{likedBy}
    },{new:true})
    const likes = await Like.create({
        video: video._id,
        likedBy:req.user._id
    })

    res.status(200).json(new ApiResponse(200, likes, "fetched success"));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}