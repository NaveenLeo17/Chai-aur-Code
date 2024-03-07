import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // //TODO: toggle like on video
    const like = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (!like) {
        const createLike = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        res.status(200)
            .json(
                new ApiResponse(200, { createLike }, "video liked")
            )
    }
    else {
        const removeLike = await Like.findOneAndDelete({
            video: videoId,
            likedBy: req.user._id
        })
        res.status(200)
            .json(
                new ApiResponse(200, { removeLike }, "like removed")
            )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    // Its not working properly
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(400, "comment Id is missing")
    }

    const likedComment = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (!likedComment) {
        console.log(likedComment);
        const createLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        return res.status(200)
            .json(
                new ApiResponse(200, { createLike }, "comment liked")
            )
    }
    else {
        const removeLike = await Like.findOneAndDelete({
            comment: commentId,
            likedBy: req.user._id
        })
        return res.status(200)
            .json(
                new ApiResponse(200, { removeLike }, "comment like removed")
            )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!tweetId) {
        throw new ApiError(400, "tweet Id is missing")
    }

    const likedTweet = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (!likedTweet) {
        const createLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })

        return res.status(200)
            .json(
                new ApiResponse(200, { createLike }, "tweet is liked")
            )
    }
    else {
        const removeLike = await Like.findOneAndDelete({
            tweet: tweetId,
            likedBy: req.user._id
        })

        return res.status(200)
            .json(
                new ApiResponse(200, { removeLike }, "tweet like is removed")
            )
    }

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const allLiked = await Like.findOne({
        likedBy: req.user._id,
        video: { $exists: true }
    })

    return res.status(200)
        .json(
            new ApiResponse(200, { allLiked }, "Success")
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}