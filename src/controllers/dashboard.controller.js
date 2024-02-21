import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userInfo = await User.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField:"_id",
                foreignField:"owner",
                as:"myVideos",
            }
        },
        {
            $lookup:{
                from: "likes",
                localField:"_id",
                foreignField:"likedBy",
                as:"myLikes",
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"mySubscriber",
            }
        },
        {
            $lookup:{
                from: "tweets",
                localField:"_id",
                foreignField:"owner",
                as:"myTweets",
            }
        },
        {
            $addFields: {

                totalVideo: { $size: "$myVideos" },
                totalTweets: { $size: "$myTweets" },
                totalLikes: { $size: "$myLikes" },
                totalSubscriber: { $size: "$mySubscriber" },
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                email:1,
                totalVideo:1,
                totalTweets:1,
                totalLikes:1,
                totalSubscriber:1
            }
        }
    ])
    res.status(200).json(new ApiResponse(200,{userInfo},"My videos list"))


})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await User.aggregate([
        {
           $match:{
            _id : new mongoose.Types.ObjectId(req.user._id)
           }
        },
        {
            $lookup:{
                from: "videos",
                localField:"_id",
                foreignField:"owner",
                as:"myVideos"
            }
        },
        {
            $unwind: "$myVideos" // $unwind is used to deconstruct the myVideos field. After that,
            //  $replaceRoot is used to set the top-level document to be the content of myVideos. 
            //  This way, you replace the root with the details of the videos.
        },
        {
            $replaceRoot: { // it will replace the user root with playlist as new root so that playlist will not inside user 
                newRoot: "$myVideos"
            }
        }
    ]);
    if(!videos) throw new ApiError(400,"No video founds") 
    res.status(200).json(new ApiResponse(200,{videos},"My videos list"))

})

export {
    getChannelStats, 
    getChannelVideos
    }