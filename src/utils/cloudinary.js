/*
🌩️ What is Cloudinary?
Cloudinary is a cloud service that lets you:

Store images, videos, PDFs, etc.

Get a URL instantly for those files.

Apply transformations like resizing, cropping, compressing, etc.

Use the file from the cloud without needing your own server space.


cloudinary is the official SDK(Software Development Kit).

fs is Node's File System module. It's used to delete the file locally if something goes wrong.

*/



import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


  cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async(localFilePath) =>{
//This function uploads a local file (which Multer stored in your ./public/temp folder) to Cloudinary.
        try{
            if(!localFilePath)return null;
            //→ If no file path is given, return null.
            //upload the file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath , {
                resource_type : "auto"
//→ Cloudinary uploads the file from your local path (localFilePath).

// "auto" means it figures out the type of file (image, video, etc.) automatically.
            })
            //file has been uploaded successfuly
            // console.log("File is Uploaded on Cloudinary", response.url);
            fs.unlinkSync(localFilePath)
            return response;
        } catch(error){
            fs.unlinkSync(localFilePath) // remove the locally saved temperory file  as the upload operation got failed
            // It deletes the file from your local storage using fs.unlinkSync() and returns null.
            // This is important because you don’t want to store unused temp files forever!
          return null;
        }
    }

    const deleteOnCloudinary = async(public_id , resource_type="image")=>{
        try {
            if(!public_id) return null;
            const result = cloudinary.uploader.destroy(public_id,{
                resource_type
            })
            return result;
            
        } catch (error) {
            console.log("Delete on Cloudinary Failed",error)
            throw error;
        }

    }





   export {uploadOnCloudinary,
           deleteOnCloudinary
          }