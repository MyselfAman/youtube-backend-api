import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {Subscription} from  "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!channelId) throw new ApiError(400,"Channel id is not provided");

    const user = await User.findById(channelId);
    if(!user) throw new ApiError(400,"Channel doesn't exits");

    const checkSubscription = await Subscription.findOne({
        $and: [
            { subscriber: req.user._id },
            { channel: channelId }
        ]
    });

    if(checkSubscription){
        const unsubscribed = await Subscription.deleteOne(checkSubscription._id);
        res.status(200).json(new ApiResponse(200,{unsubscribed},"Unsubscribed successfully..."))
    }

    if(!checkSubscription){
        const subscribed = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });

        res.status(200).json(new ApiResponse(200,{subscribed},"Subscribed successfully..."))
    }

    



    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // const mySubscriber = await Subscription.find({subscriber: channelId});
    const mySubscriber = await Subscription.aggregate([
        {
            $match:{
                channel: channelId
            }
        }
    ])
    res.status(200).json(new ApiResponse(200,{mySubscriber},"Subscriber fetched successfully..."))



});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const subscribedChannel = await User.aggregate([
        {
            _id: new mongoose.Types.ObjectId(subscriberId)
        },
        {
            $lookup:{
                from:"subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedChannel"
            }

        }
    ])

    res.status(200).json(new ApiResponse(200,subscribedChannel,"Tweet has been deleted."))



});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}