import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"


//register
const registerUser = asyncHandler (async (req , res)=>{
 // ALOGORITM FOR REGISTER USER!!!!!!!!     
    //get user details from frontend
    //validation -not empty
    //check if user already exists : username , email
    //check for images, check for avatar
    //upload them to cloudinary , avatar uploaded
    //create user object - create entry in db
    //remove passsword and refresh token field from response
    //check for user creation huwa ya nahie
    //return res wrna error

   
    //user details and use postman
    //🧠 What is req.body?
    //In Express.js:
    //req.body contains the data sent in the body of a POST request


    const {fullname , email , username , password} = req.body
    console.log("email :" , email)


    // user validation
    if(
        [fullname,email,username,password].some((field)=>
            field?.trim()==="") // trim function is used to trim the whitespaces and still if the field has space that means the field is empty and we return true
    ){
        throw new ApiError(400 , "All fields are required")

    }

    // if user already exists or not
    // const existedUser = User.findOne({ $or : [{username} , {email} ]
    //It checks if either condition is true.
    //"Find a user whose username OR email matches the input."
    
    const existedUser = await User.findOne({ 
        $or : [{username} , {email} ]
    })

    if(existedUser){
        throw new ApiError(409 , "User with email or username already exists")
    }
    

    //check for images and avatar
    /*
    It’s the same as saying:
    🗣️
   "Hey JavaScript, check if req.files exists.
    If it does, check if req.files.avatar exists.
    If that exists, check if req.files.avatar[0] exists.
    If that exists, then give me .path."
    But if any of those don’t exist, just give me undefined instead of crashing the app.
    */

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar File is required")
    }
     
    //upload them to cloudinary
    //You're using await because the upload is asynchronous — it takes time.
    //So the program waits for Cloudinary to upload the file before moving to the next line.



    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){ // if file upload failed
        throw new ApiError(400 , "Avatar File is required")
    }

    //create object and entry in database

    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "", // cover image kay liye pehle koie check nai diya tha abh wo bhi daikhna hai ki wo ayah pr hai ya anhie
        email,
        password,
        username:username.toLowerCase()
    })
     
    //delete password and refreshToken
    const createdUser = await User.findById(user._id).select( // mongodb gives a particular entry a unique id that is 
        //represented by _id and every entry has that we will select that only and remove refreshtoken and password from it  
        "-password -refreshToken"
    )
    //You're telling MongoDB:
    //"Give me all the user fields except password and refreshToken."
    
    //check for user creation
    if(!createdUser){
        throw new ApiError(500 , "Something went Wrong While Registering the User")
    }

    //if user properly stored then give a response

    return res.status(201).json(
        new ApiResponse(200, createdUser , "User Registered Successfully")
        //You're creating a custom response object in which password and refreshTokens 
        //will not be included
    )


    })



export {registerUser}