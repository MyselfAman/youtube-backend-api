import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose"
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(name === "" && description === "") throw new ApiError(400,"Please provide name & decription.");


    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    });

    if(!createdPlaylist) throw new ApiError(400,"playlist is not created please check name or description has been provided or not");


    res.status(200).json(new ApiResponse(200,{createdPlaylist},"Playlist has been created."))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!userId  ) throw new ApiError(400,"Please provide user id.");

    const user  = await User.findById(userId);

    if(!user) throw new ApiError(400,"Please provide valid user id.");

    const playlist  = await User.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(req.user._id),

            }
        },
        // {
        //     $project: {
        //         username:1,
        //         email:1,
        //         fullname:1
        //     }
        // },
        {
            $lookup:{
                from:"playlists",
                localField:"_id",
                foreignField: "owner",
                as:"myPlaylist",
                pipeline:[
                    {
                        $project:{ //  fields u want from playlist
                            name:1,
                            description:1
                        }
                    }
                ]
            },
            
        },
        {
            $replaceRoot: { // it will replace the user root with playlist as new root so that playlist will not inside user 
                newRoot: {
                    $arrayElemAt: ["$myPlaylist", 0]
                }
            }
        }
        
        
    ])


    if(!playlist) throw new ApiError(400,"Please provide valid user id.");

    res.status(200).json(new ApiResponse(200,{playlist},"Playlist has been updated."))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!playlistId  ) throw new ApiError(400,"Please provide playlist id.");

    const playlist  = await Playlist.findById(playlistId);

    if(!playlist) throw new ApiError(400,"Please provide valid playlist id.");

    res.status(200).json(new ApiResponse(200,{playlist},"Playlist details fetched."))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId  && !videoId) throw new ApiError(400,"Please provide playlist and video id.");

    const playlist  = await Playlist.findById(playlistId);

    if(!playlist) throw new ApiError(400,"Please provide valid playlist id.");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist._id,{
        $push: {videos : videoId}
    },{new:true})

    res.status(200).json(new ApiResponse(200,{updatedPlaylist},"videos has been added to playlist"))


})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId  && !videoId) throw new ApiError(400,"Please provide playlist and video id.");

    const playlist  = await Playlist.findById(playlistId);

    if(!playlist) throw new ApiError(400,"Please provide valid playlist id.");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist._id,{
        $pull: {videos : videoId}
    },{new:true})

    res.status(200).json(new ApiResponse(200,{updatedPlaylist},"videos has been added to playlist"))



})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId)  throw new ApiError(400,"Please provide playlist id.");

    const playlist  = await Playlist.findById(playlistId);

    if(!playlist) throw new ApiError(400,"Please provide valid playlist id.");

    const deletedPlaylist = await Playlist.deleteOne(playlist._id)


    res.status(200).json(new ApiResponse(200,{deletedPlaylist},"Playlist has been deleted successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    console.log(playlistId);
    const {name, description} = req.body
    //TODO: update playlist

    if(!playlistId  ) throw new ApiError(400,"Please provide playlist id.");

    const playlist  = await Playlist.findById(playlistId);

    if(!playlist) throw new ApiError(400,"Please provide valid playlist id.");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist._id,{
        $set: {name : name , description : description}
    },{new:true})

    res.status(200).json(new ApiResponse(200,{updatedPlaylist},"Playlist has been updated."))


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}