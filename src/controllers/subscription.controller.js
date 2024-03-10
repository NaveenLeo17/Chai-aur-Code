import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "channelId is invalid")
    }
    const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if (!subscription) {
        const createSubscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })

        return res.status(200)
            .json(
                new ApiResponse(200, createSubscription, "Success")
            )
    }
    else {
        const removeSubscription = await Subscription.findOneAndDelete({
            subscriber: req.user._id,
            channel: channelId
        })

        return res.status(200)
            .json(
                new ApiResponse(200, removeSubscription, "Success")
            )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriber = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ]
            }
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscribers",
                },
            },
        },
        {
            $project: {
                subscribers: 1
            }
        }
    ])

    if (subscriber.length == 0) {
        throw new ApiError(404, "No subscriber found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscriber, "fetched subscirber successfully!"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // const { subscriberId } = req.params
    const { channelId } = req.params;
    if (!channelId?.trim() || !isValidObjectId(channelId)) {
        throw new ApiError(400, "channelId is required");
    }
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId.trim())
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribersList",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscribersList: {
                    $first: "$subscribersList"
                }
            }
        },
        {
            $project: {
                subscribersList: 1,
                _id: 0
            }
        },
        {
            $replaceRoot: {
                newRoot: "$subscribersList"
            }
        }
    ]);

    res.status(200).json(new ApiResponse(
        200,
        subscribers,
        "Get channel subscribers list success"
    ));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}