import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body
    if (!content?.trim()) {
        throw new ApiError(400, "content is missing")
    }

    const owner = req.user._id
    // console.log(owner)

    const tweet = await Tweet.create({
        content,
        owner
    })
    // console.log(tweet._id)

    const createdTweet = await Tweet.findById(tweet._id)

    return res.status(200)
        .json(
            new ApiResponse(200, createdTweet, "tweet successfully created")
        )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params
    if (!userId) {
        throw new ApiError(400, "userId is missing")
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "userId is not valid")
    }

    const tweets = await Tweet.find({
        owner: userId
    })
    if (!tweets) {
        new ApiResponse(200, [], "User has no tweets")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, tweets, "user tweets fetched successfully")
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // get tweet id we want to update
    // take updated tweet from the body
    // verify the tweet that it exist
    // find the tweet
    // update the content of the tweet 
    // save the changes in the db

    const { tweetId } = req.params
    const { content } = req.body

    if (!tweetId) {
        throw new ApiError(400, "tweetId is missing")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweed Id is invalid")
    }


    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content
            }
        },
        { new: true }
    )

    return res.status(200)
    .json(
        new ApiResponse(200, updatedTweet, "tweet updated successfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    // get the tweet id we want to delete
    // varify tweet id
    // find that tweet and delete it 

    const {tweetId} = req.params
    if (!tweetId) {
        throw new ApiError(400, "tweet id is missing")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweet id is invalid")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)
    // console.log(tweet);

    if (!tweet) {
        throw new ApiError(400, "error occured while deleting tweet")
    }

    res.status(200)
    .json(
        new ApiResponse(200, "Tweet deleted succesfully")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}