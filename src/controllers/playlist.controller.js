import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    //TODO: create playlist
    if (!(name && description)) {
        throw new ApiError(400, "name or description is missing")
    }
    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user._id
    })
    if (!playlist) {
        throw new ApiError(500, "something went wrong while creating playlist")
    }
    return res.status(200)
        .json(
            new ApiResponse(200, { playlist }, "Playlist created successfully")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!userId) {
        throw new ApiError(400, "userId is missing")
    }

    const allPlaylist = await Playlist.find({
        owner: req.user._id
    })
    console.log(allPlaylist)
    if (!allPlaylist) {
        throw new ApiError(500, "something went wrong")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, { allPlaylist }, "Success")
        )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!playlistId) {
        throw new ApiError(400, "playlist Id is missing")
    }

    const playlist = await Playlist.findById(playlistId)
    console.log(playlist)

    if (!playlist) {
        throw new ApiError(500, "something went wrong")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, { playlist }, "Success")
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId both required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: new mongoose.Types.ObjectId(videoId)
            }
        },
        { new: true }
    )

    return res.status(200)
        .json(
            new ApiResponse(200, { playlist }, "Success")
        )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId both required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    )
    return res.status(200)
        .json(
            new ApiResponse(200, { playlist }, "Success")
        )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(400, "playlistId is missing")
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId)
    return res.status(200)
        .json(
            new ApiResponse(200, { playlist }, "Success")
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if(!playlistId || !name || !description){
        throw new ApiError(400, "playlist, name and description all required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name: name,
            description: description
        },
        { new: true }
    )
    return res.status(200)
        .json(
            new ApiResponse(200, { playlist }, "Success")
        )
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