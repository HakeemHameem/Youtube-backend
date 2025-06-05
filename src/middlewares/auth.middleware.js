import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")// ye mtlb "bearer " <token> aise hota hai jab hm "bearer " isko replace kre ge "" tou sirf abh token he bacha na 
        
        // console.log(token);
        if (!token) { // when request is made from frontend when the user has been already logged out 
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)//Was this token really signed by our server using the secret key?"
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        /*
        ✅ It attaches the user object to the request (req) so that:
        Any route or function that runs after this middleware can access it.
        Think of it like putting the user in your backpack so you can carry it to the next function. 🎒
        Tou yaha pr jaise hamara loggedoutUser wala method issko use kre ga   
        */
        next() // move to the next thing after the middleware
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})