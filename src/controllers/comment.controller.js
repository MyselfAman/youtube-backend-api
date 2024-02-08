import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

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


    res.status(200).json(new ApiResponse(200,{updatedComment},"Comment has been created."))
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