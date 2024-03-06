import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const allComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId), // When matching the raw Video id to video id in Database
            },
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: parseInt(limit, 10),
        },
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, { allComments }, "Success"));
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    // take content from body
    // take video id from user
    // create comment in db
    // fetched that comment and send in res

    const { content } = req.body
    const { videoId } = req.params
    const owner = req.user._id

    if (!content) {
        throw new ApiError(400, "content is missing")
    }
    if (!videoId) {
        throw new ApiError(400, "video Id is invalid")
    }

    const addComments = await Comment.create({
        content: content,
        video: videoId,
        owner: owner
    })

    // console.log(addComments);
    // console.log({ addComments: addComments });

    return res.status(200)
        .json(
            new ApiResponse(200, { addComments: addComments }, "comments created succesffuly")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const {content} = req.body
    if (!content) {
        throw new ApiError(400, "content is required")
    }
    if (!commentId) {
        throw new ApiError(400, "commentId invalid")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        { new: true }
    )

    return res.status(200)
    .json(
        new ApiResponse(200, updatedComment, "Success")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params
    if (!commentId) {
        throw new ApiError(400, "commentId invalid")
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if (!deletedComment) {
        throw new ApiError(500, "something went wrong while deleting comment")
    }

    res.status(200)
    .json(
        new ApiResponse(200, {deletedComment}, "Success")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}