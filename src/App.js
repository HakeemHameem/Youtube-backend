import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


app.use(cors({
    origin : process.env.CORS_ORIGIN,
    Credential : true
}))

app.use(express.json({limit : "16kb"})) //json data kitna lena hai short mai json data limit mai aaye

app.use(express.urlencoded({extended : true , limit : "16kb"}))  //url se jab data aaye ga ya ham keh sakte hai forms wagaira sai jab data aata hai tab
// mtlab ham isko encoded URL de sakte hain and it will be converted to object format
app.use(express.static("public")) // ham isse apne videos or photos ko serve kar skte hain 

app.use(cookieParser()) // it helps us to read cookies sent by the browser


//Routes import

import userRouter from './routes/user.routes.js'


//Routes decleration

app.use("/api/v1/users" , userRouter)

// https://localhost:8000/api/v1/users/register








export {app}