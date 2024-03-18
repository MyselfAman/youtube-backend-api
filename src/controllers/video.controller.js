import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy="title" , sortType= "asc", userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
    const listofvideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id),
                // $text: { $search: query }
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $sort: {
                [sortBy]: sortType === 'asc' ? 1 : -1
            }
        }   

    ]);

    res.status(200).json(
        new ApiResponse(200, { listofvideos }, "Video uploaded successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (title == "" && description === "")
        throw new ApiError(
            400,
            "Please provide title and description for video."
        );

    let videoFilePath;
    let thumbnailFilePath;
    if (
        req.files &&
        Array.isArray(req.files.videoFile) &&
        req.files.videoFile.length > 0 &&
        Array.isArray(req.files.thumbnail) &&
        req.files.thumbnail.length > 0
    ) {
        videoFilePath = req.files?.videoFile[0].path;
        thumbnailFilePath = req.files?.thumbnail[0].path;
    }

    if (videoFilePath === "" && thumbnailFilePath === "") {
        throw new ApiError(400, "File not found in your local device");
    }

    const videoFileUploaded = await uploadCloudinary(videoFilePath);
    const thumbnailFileUploaded = await uploadCloudinary(thumbnailFilePath);
    console.log(videoFileUploaded);
    console.log(thumbnailFileUploaded);
    if (videoFileUploaded === "" && thumbnailFileUploaded === "") {
        throw new ApiError(400, "File not found in your local device");
    }

    const video = await Video.create({
        title,
        description,
        thumbnail: thumbnailFileUploaded.url,
        videoFile: videoFileUploaded.url,
        duration: videoFileUploaded.duration,
        views: videoFileUploaded.views,
        owner: req.user?._id,
        isPublished: videoFileUploaded?.url ? true : false,
    });

    if (!video) throw new ApiError(400, "Oops video's not uploaded.");

    res.status(200).json(
        new ApiResponse(200, { video }, "Video uploaded successfully")
    );

    // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
    if (!videoId) throw new ApiError(400, "Invalide video id");

    const video = await Video.findById(videoId);

    if (!video) throw new ApiError(400, "Invalide video id video not found");

    res.status(200).json(
        new ApiResponse(200, { video }, "video details fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    if (!videoId) throw new ApiError(400, "Please provide video id");
    const { title, description } = req.body;
    if (title === "" && description === "" && videoId === "")
        throw new ApiError(
            400,
            "Please provide title, description or thumbnail to update"
        );

    const thumbnailFilePath = req.file?.path;

    if (title === "" && description === "" && !thumbnailFilePath)
        throw new ApiError(400, "Please provide thumbnail");

    const uploadedThumbnail = await uploadCloudinary(thumbnailFilePath);

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title,
                description: description,
                thumbnail: uploadedThumbnail?.url,
            },
        },
        { new: true }
    );

    res.status(200).json(
        new ApiResponse(200, { video }, "video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) throw new ApiError(400, "Please provide video id");

    const video = Video.findById(videoId);

    if (!video) throw new ApiError(400, "Invalid video id.");

    const videoDeleted = await Video.deleteOne(video._id);

    if (!videoDeleted)
        throw new ApiError(
            400,
            "Video is not deleted there is some problem try again"
        );

    res.status(200).json(
        new ApiResponse(200, { videoDeleted }, "Video deleted successfully.")
    );

    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const { publish } = req.body;
    if (publish === "")
        throw new ApiError(400, "Please provide publish status of the video");

    if (!videoId) throw new ApiError(400, "Please provide video id");

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: { isPublished: publish },
        },
        { new: true }
    );

    if (!video)
        throw new ApiError(
            400,
            "Publish is not updated please check data and video id."
        );

    res.status(200).json(
        new ApiResponse(200, { video }, "Publised has been updated.")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
