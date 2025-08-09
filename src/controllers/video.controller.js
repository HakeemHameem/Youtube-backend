import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
/*

🔁 What is pipeline = []?
You're defining your own custom aggregation pipeline for MongoDB.

You add different $stages to this array using pipeline.push({ ... }).

Each stage transforms or filters the data progressively.

At the end, it’s like a smart query that does filtering, sorting, searching, joining, and pagination — all in one!



*/

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    console.log(userId)
    const pipeline = [];

    if(query){
        pipeline.push({
            $search:{
                index:"search-videos",
                text : {
                    query : query,
                    path : ["title","description"] // search on only title and description
                }
            }
        });
    }
    
    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid userId")
        }

        pipeline.push({
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        });
    }

    //fetch videos only that are set as isPublished as true

    pipeline.push({$match : {isPublished : true}})

    //sortBy can be views, createdAt, duration
    //sortType can be ascending(-1) or descending(1)
    
    if(sortBy && sortType){
        pipeline.push({
            $sort : {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        })
    }else{
        pipeline.push({$sort : {createdAt : -1}});
    }

    pipeline.push(
        {
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as :"ownerDetails",
                pipeline : [
                    {
                        $project:{
                            username:1,
                            "avatar.url":1
                        }
                    }
                ]
            }
        },{
            $unwind:"$ownerDetails" // now owner details is feild now so “Look at the field called ownerDetails in each document and do something with it.”
        }
    )

    /*
    👉 What this does:
This line creates an aggregation query on the Video collection using the pipeline we just built earlier (with $search, $match, $sort, $lookup, etc.).
It doesn't execute the query yet, it just prepares it.
Think of this like:
"Here’s the list of steps MongoDB should follow to get the final videos."
   */
   const videoAggregate = Video.aggregate(pipeline)

   const options = {
    //page is which page you want
    page : parseInt(page , 10), // arseInt(page, 10) means: "Convert page string to an integer, treating it as base 10.It has nothing to do with page limit or total pages.
    limit : parseInt(limit,10) // per page limit
    //limit is how many videos per page  
    /*
    🔧 You're using page = 2 and limit = 5
     This means:
     You want 5 items per page And you want to see the second page of results
     So MongoDB will do the following internally:

      .skip((page - 1) * limit)
      .limit(limit)
       Substitute the values:
      .skip((2 - 1) * 5) => .skip(5)
      .limit(5)
      Let’s say you have these 12 video documents in the database, with IDs 1 through 12:

[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
Now .skip(5) means:

Skip the first 5 documents

That leaves:

[6, 7, 8, 9, 10, 11, 12]
Then .limit(5) means:

From what's left, give me only the first 5

So you get:

[6, 7, 8, 9, 10]
✅ And that's how you get videos 6 to 10 on page 2.
    
    

    */
};

   const video = Video.aggregatePaginate(videoAggregate,options)

   return res
   .status(200)
   .json(new ApiResponse(200,video,"Videos fetched successfully"))


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if([title,description].some((field)=>field.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }
    const VideoFileLocalPath=req.files?.videoFile[0].path;
    const thumbnailFileLocalPath=req.files?.thumbnail[0].path;
    
    if(!VideoFileLocalPath){
        throw new ApiError(400 , "VideoLocalPath is required")
    }
    if(!thumbnailFileLocalPath){
        throw new ApiError(400 , "thumbnailLocalPath is required")
    }

    const videoFile = await uploadOnCloudinary(VideoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailFileLocalPath)
    
    
    if(!videoFile){
        throw new ApiError(400,"video file not found")
    }
    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail not found");
    }

    const video = await Video.create({
        title,
        description,
        duration:videoFile.duration,
        videoFile:{
            url:videoFile.url,
            public_id:videoFile.public_id
        },
        thumbnail:{
            url:thumbnail.url,
            public_id:thumbnail.public_id
        },
        owner : req.user?._id,
        isPublished:false
    });

    const videoUploaded = await Video.findById(video._id)
     if (!videoUploaded) {
        throw new ApiError(500, "videoUpload failed please try again !!!");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
