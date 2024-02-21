import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Video} from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose"
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    if(!videoId) throw new ApiError(404,"No videoId found.")

    const {page = 1, mylimit = 10} = req.query
    console.log(req.query)
    console.log(page,mylimit)


    const video =  await Video.findById(videoId);

    if(!video) throw new ApiError(404,"Video id is wrong.")

    const videoComments = await Video.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "videoComments",
                pipeline:[
                    {
                        $project:{
                            content: 1
                        }
                    },
                    {
                        $limit: mylimit
                    }
                ]
            }
        },
        {
            $project:{
                videoComments:1
            }
        },
        {
            $skip: (page - 1) * mylimit
        },
        {
            $limit: mylimit
        }    
    ])

    if(!videoComments) throw new ApiError(404,"Video id is wrong.")

    res.status(200).json(new ApiResponse(200,{videoComments},"Comments of video has been recived."));


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const videoId = req.params;
    if(!videoId.videoId) throw new ApiError(400,"Please provide video id.");

    const {comment} = req.body;

    if(comment === "") throw new ApiError(400,"Please provide comment.");


    const createdComment = await Comment.create({
        owner: req.user._id,
        video: videoId.videoId,
        content: comment
    });

    if(!createdComment) throw new ApiError(400,"Comment is not created please check requiredd field video id and comment ");


    res.status(200).json(new ApiResponse(200,{createdComment},"Comment has been created."))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    if(!commentId) throw new ApiError(400,"Please provide comment id.");

    const {comment} = req.body;

    if(comment === "") throw new ApiError(400,"Please provide comment.");


    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        content: comment
    },{new:true});

    if(!updatedComment) throw new ApiError(400,"Comment is not created please check requiredd field video id and comment ");


    res.status(200).json(new ApiResponse(200,{updatedComment},"Comment has been created."));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if(!commentId) throw new ApiError(400,"Please provide comment id.");

    const myComment = await Comment.findById(commentId);
    if(!myComment) throw new ApiError(400,"Invalid comment id");
    const deletedComment = await Comment.deleteOne(myComment._id);

    res.status(200).json(new ApiResponse(200,{deletedComment},"Comment has been deleted."))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }