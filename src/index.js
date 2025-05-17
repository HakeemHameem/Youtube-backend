// import dotenv from "dotenv"
// import connectDB from "./db/index.js"


// dotenv.config({
//     path : './env'
// }) 


// connectDB()



import dotenv from "dotenv"
import connectDB  from "./db/index.js"
import { app } from "./App.js"

dotenv.config({
     path : './env'  
})



connectDB()  //returns a promise
.then(()=>{
    app.on("error" , (error)=>{
        console.log("ERRR:" , error);
        throw error
        
    })
    app.listen(process.env.PORT || 8000 , () =>{
        console.log(`Server is running at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Connection Failed")
})


















//Aavi Code

/*( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERR : " , error);
            throw error
        })

        app.listen(process.env.PORT , ()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
        
    } catch (error) {
        console.log("error is there",  error)
        throw error  
    }   

})() */
