import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const createTweet = asyncHandler(async (req, res) => {
    const {tweet} = req.body;

    if(tweet === "") throw new ApiError(400,"Please provide tweet.");


    const createdTweet = await Tweet.create({
        owner: req.user._id,
        content: tweet
    });

    if(!createdTweet) throw new ApiError(400,"tweet is not created please check tweet has been provided or not");


    res.status(200).json(new ApiResponse(200,{createdTweet},"Tweet has been created."))
    
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
   
    res.status(200).json(new ApiResponse(200, tweets, "tweets fetched success"));

})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweet} = req.body;
    const {tweetId} = req.params

    if(tweet === "") throw new ApiError(400,"Please provide tweet.");
    if(tweetId === "") throw new ApiError(400,"Please provide tweet id.");

    const myTweet = await Tweet.findById(tweetId);
    if(!myTweet) throw new ApiError(400,"Please check tweet id.");

    const updatedTweet = await Tweet.findByIdAndUpdate(myTweet._id,{
        $set :{content: tweet}
    },{new:true});

    if(!updatedTweet) throw new ApiError(400,"tweet is not created please check tweet id & tweet has been provided or not");


    res.status(200).json(new ApiResponse(200,{updatedTweet},"Tweet has been updated."))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if(tweetId === "") throw new ApiError(400,"Please provide tweet id.");

    const myTweet = await Tweet.findById(tweetId);
    if(!myTweet) throw new ApiError(400,"Please check tweet id.");

    const deletedTweet = await Tweet.deleteOne(myTweet._id);

    res.status(200).json(new ApiResponse(200,{deletedTweet},"Tweet has been deleted."))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}