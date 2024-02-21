import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId) throw new ApiError(400,"Please provide video id")
    const video = await Video.findById(videoId);

    if(!video) throw new ApiError(400,"Please provide valid video id");
    const checkLikedOrNot = await Like.find({likedBy : req.user._id , video : videoId});
  
    if(checkLikedOrNot.length === 0){
        const liked = await Like.create({
            video: video._id,
            likedBy:req.user._id
        })

        res.status(200).json(new ApiResponse(200, liked, "Video liked successfully"));

    }

    if(checkLikedOrNot.length !== 0){
        const removedLiked = await Like.deleteOne(checkLikedOrNot._id);
        res.status(200).json(new ApiResponse(200, removedLiked, "Video unliked successfully"));

    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId) throw new ApiError(400,"Please provide comment id")
    const comment = await Comment.findById(commentId);

    if(!comment) throw new ApiError(400,"Please provide valid comment id");

    const checkLikedOrNot = await Like.find({likedBy : req.user._id , comment : commentId});
    if(checkLikedOrNot.length === 0){
        const liked = await Like.create({
            comment: commentId,
            likedBy:req.user._id
        })

        res.status(200).json(new ApiResponse(200, liked, "Comment liked successfully"));

    }

    if(checkLikedOrNot.length !== 0){
        const removedLiked = await Like.deleteOne(checkLikedOrNot._id);
        res.status(200).json(new ApiResponse(200, removedLiked, "Comment unliked successfully"));

    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId) throw new ApiError(400,"Please provide tweet id")
    const tweet = await Tweet.findById(tweetId);

    if(!tweet) throw new ApiError(400,"Please provide valid tweet id");

    const checkLikedOrNot = await Like.find({likedBy : req.user._id , tweet : tweetId
    });
    if(checkLikedOrNot.length === 0){
        const liked = await Like.create({
            tweet: tweetId,
            likedBy:req.user._id
        })

        res.status(200).json(new ApiResponse(200, liked, "Tweet liked successfully"));

    }

    if(checkLikedOrNot.length !== 0){
        const removedLiked = await Like.deleteOne(checkLikedOrNot._id);
        res.status(200).json(new ApiResponse(200, removedLiked, "Tweet unliked successfully"));

    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideo =  await Like.find({likedBy: req.user._id}, {video:1});
    

    res.status(200).json(new ApiResponse(200, likedVideo, "Liked videos fetched successfully"));


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}