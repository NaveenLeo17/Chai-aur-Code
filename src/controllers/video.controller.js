import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    page = isNaN(page) ? 1 : Number(page);
    limit = isNaN(page) ? 10 : Number(limit);

    //because 0 is not accepatabl ein skip and limit in aggearagate pipelien
    if (page < 0) {
        page = 1;
    }
    if (limit <= 0) {
        limit = 10;
    }

    const matchStage = {};
    if (userId && isValidObjectId(userId)) {
        matchStage["$match"] = {
            owner: new mongoose.Types.ObjectId(userId),
        };
    } else if (query) {
        matchStage["$match"] = {
            $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ],
        };
    } else {
        matchStage["$match"] = {};
    }
    if (userId && query) {
        matchStage["$match"] = {
            $and: [
                { owner: new mongoose.Types.ObjectId(userId) },
                {
                    $or: [
                        { title: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } },
                    ],
                },
            ],
        };
    }

    const sortStage = {};
    if (sortBy && sortType) {
        sortStage["$sort"] = {
            [sortBy]: sortType === "asc" ? 1 : -1,
        };
    } else {
        sortStage["$sort"] = {
            createdAt: -1,
        };
    }

    const skipStage = { $skip: (page - 1) * limit };
    const limitStage = { $limit: limit };

    const videos = await Video.aggregate([
        matchStage,
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        sortStage,
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
                likes: {
                    $size: "$likes"
                }
            },
        },
    ]);

    if (!videos) {
        throw new ApiError(404, "No videos found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "video fetched successfully !"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    //get videoFile, thumbnail and other details
    //upload the videoFile and thumbnail on cloudinary
    //store the other details and videoFile and thumbnail url in db
    //create a video name instance

    const { title, description } = req.body
    if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    let videoFileLocalPath, thumbnailLocalPath
    if (req.files) {
        if (req.files.videoFile && req.files.videoFile.length > 0) {
            videoFileLocalPath = req.files?.videoFile[0].path
        }
        if (req.files.thumbnail && req.files.thumbnail.length > 0) {
            thumbnailLocalPath = req.files?.thumbnail[0].path
        }
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "videoFile upload failed")
    }
    if (!thumbnail) {
        throw new ApiError(400, "thumbnail upload failed")
    }

    console.log(videoFile.duration)

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user._id,
    })
    // console.log(video.duration);

    const uploadedVideo = await Video.findById(video._id)
    if (!uploadedVideo) {
        throw new ApiError(500, "Something went wrong while uploading the video")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, uploadedVideo, "Video uploaded successfully")
        )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "video Id is invalid")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(500, "something went wrong")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, {video}, "Success")
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description, thumbnail} = req.body
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is invalid")
    }

    if (!(title, description, thumbnail)) {
        throw new ApiError(400, "all details are required")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            title: title,
            description: description,
            thumbnail: thumbnail
        },
        {new: true}
    )

    res.status(200)
        .json(
            new ApiResponse(200, {video}, "Success")
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is invalid")
    }

    const video = await Video.findByIdAndDelete(videoId)

    return res.status(200)
        .json(
            new ApiResponse(200, video, "Success")
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if (video.isPublished){
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    isPublished: false
                }
            },
            {new: true}
        )

        return res.status(200)
            .json(
                new ApiResponse(200, {video}, "Success")
            )
    }
    else {
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    isPublished: true
                }
            },
            {new: true}
        )

        return res.status(200)
            .json(
                new ApiResponse(200, {video}, "Success")
            )
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}