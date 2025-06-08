import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import { upload } from "../middlewares/multer.middleware.js"

// method for refresh and access tokens

const generateAccessAndRefreshToken = async (userId)=>{

    try {
        const user = await User.findById(userId)
        const refreshToken=user.generateRefreshToken()
        const accessToken=user.generateAccessToken()
        
        //Add refresh token in db
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false}) // ye krna zoroori hai wrna ye pehle password true hona chahiye tou ham bolte hain isko validate mat kro sirf save kro
        
        return {refreshToken , accessToken}
          
    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating Access and Refresh Token")
        
    }
}



//** Register User **
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
    console.log("password :" , password )


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
   
   // 1. Checks if 'req.files' exists (i.e., files were uploaded)
  // 2. Checks if 'coverImage' field exists and is an array
 // 3. Checks if the array is not empty
  /*
Example Context:
If you're using a middleware like multer for handling file uploads in Node.js (Express), and a user uploads
a file with the form field name coverImage, the file will be available in req.files.coverImage,
typically as an array of file objects.

 */


  
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

//** Login User **
   const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // Check for email or username
    if (!username && !email) {
        throw new ApiError(400, "Email or Username is required");
    }

    // Find user by email or username
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        throw new ApiError(404, "User not registered");
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log(isPasswordValid)
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is wrong");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Get user details without sensitive info
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Set cookie options
    const options = {
        httpOnly: true,
        secure: true, // set to true if using HTTPS
        sameSite: "Strict", // optional: helps prevent CSRF
    };

    // Send cookies and response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    // refreshToken: avoid sending this in JSON if it's in cookie
                },
                "User logged in successfully"
            )
        );
});

// **Log Out **
   const logoutUser = asyncHandler(async (req, res) => {
    // 1. Safely update user's refresh token to undefined
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    // 2. Define secure cookie options
    const options = {
        httpOnly: true,
        secure: true,           // true only if using HTTPS
        sameSite: "Strict",     // optional but recommended
    };

    // 3. Clear cookies and send success response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User Logged Out Successfully")
        );
});  

// refresh the access token that will be renewed authormatically through this method

const refrestAccessToken = asyncHandler(async(req , res)=>{
      const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

      if(!incomingRefreshToken){
        throw new ApiError(401 , "Unauthorized Request")
      }
    
    //verify this token from cookies
   try {
     
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
 
     // now we want decoded token 
     const user = await User.findById(decodedToken?._id)
 
     if(!user){
         throw new ApiError(401 , "Refresh Token Unauthorized")
     }
 
     //compare incoming and db's refresh token
 
     if(incomingRefreshToken != user?.refreshToken){
         throw new ApiError(401 , "Invalid Refresh Token")
     }
     
      const options = {
         httpOnly: true,
         secure: true, // set to true if using HTTPS
         sameSite: "Strict", // optional: helps prevent CSRF
     };
 
     const {accessToken , newrefreshToken} = await generateAccessAndRefreshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken", accessToken,options)
     .cookie("refreshToken",newrefreshToken,options)
     .json(
             new ApiResponse(
                 200,
                 {   
                     newrefreshToken,
                     accessToken,
                     // refreshToken: avoid sending this in JSON if it's in cookie
                 },
                 "Access Token Refreshed Successfully!"
             )
         );
     
 
   } catch (error) {
      throw new ApiError(401 , error?.message || "Refreshing of Access Token Failed")
    
   }

    


})


const ChangeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordVerified = user.isPasswordCorrect(oldPassword)

    if(!isPasswordVerified){
        throw new ApiError(400 , "Invalid old password") 
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})


    return res
    .status(200)
    .json(new ApiResponse(200 ,{},"Password Changed Successfully"))
})


const getCurrentUser = asyncHandler(async(req,res)=>{ // get the current user as in middleware we have already injected that user in req.body so its very easy for us to get the user
    return res
    .status(200)
    .json(200 , req.user,"Current User Fetched Successfully!")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {email , fullname} = req.body

    if(!email || !fullname){
        throw new ApiError(400 , "All fields are required")
    }

    const Updateduser = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullname,
                email
            }
        },
        {new : true}
    ).select("-password")
    return res.
    status(200)
    .json(new ApiResponse(200, Updateduser , "Account details updated successfully" ))
})


const updateUserAvatar = asyncHandler(async(req , res)=>{

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
         throw new ApiError(400 , "Error while uploading updated avatar")

    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }

        },
        {
           new : true
        }
    ).select("-password")


})



export {registerUser, 
        loginUser,
        logoutUser,
        refrestAccessToken,
        ChangeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar }