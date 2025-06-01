import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new Schema({
    username:{
        type : String,
        required : true,
        unique : true,
        lowercase:true,
        trim : true,
        index : true
    },
    email:{
        type : String,
        required : true,
        unique : true,
        lowercase:true,
        trim : true,    
    },
    fullname:{
        type : String,
        required : true,
        lowercase:true,
        index : true,
        
    },
    avatar : {
        type : String,
        required : true,

    },
    coverImage : {
        type : String,
    },
    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }

    ],
    password : {
        type : String,
        required : [true , "Password is required"]
    },
    refreshToken:{
        type : String
    }
}, 
{timestamps : true}
);

userSchema.pre("save", async function (next) {   // for saving and encryption of the password using preHook
    if(!this.isModified("password"))return next();
    this.password = bcrypt.hash(this.password , 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
   await bcrypt.compare(password,this.password) // It gives either password is coorect or not??

}

userSchema.methods.generateAccessToken = function(){
    jwt.sign({
        _id : this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    } 
)
}

userSchema.methods.generateRefreshToken = function(){ //contains less info LIKE ONLY id
 // we can generate n number of access tokens from refresh tokens because access tokens are temeprory and for shoter peroid of time
 // in order to get access from the API server but it expires after some time so we can generate more access token
 /// from the refresh Tokens when access tokens expires 
    jwt.sign({
        _id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    } 
)
}



export const User = mongoose.model("User",userSchema)


