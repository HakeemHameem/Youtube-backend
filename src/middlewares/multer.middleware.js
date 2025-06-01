/* multer is a Node.js middleware used to handle file uploads from forms (like when a user uploads an image). It processes
 incoming files and makes them available on req.file or 
 req.files.

🧠 So... Why Are We Using It?
:::::::::Purpose Reason:::::

multer --> To handle multipart/form-data file uploads
diskStorage -->	To control where and how files are saved
destination -->	To set the folder path (./public/temp)
filename --> To control how the uploaded files are named
upload --> To create middleware for routes that handle file uploads


🧠 Think of it like:
Imagine someone is uploading a file to your site:

🧾 Client sends a form with a file (multipart/form-data)

🧱 Multer:

.) Receives the file

.) Saves it (e.g., to ./public/temp)

.) Adds info to req.file

📦 Then your route handler decides:

.) Is it an image? A PDF?

.) Should it be stored in DB/cloud?

.) Is it too big?

🧠 req.file contains all the data about the Image
*/


import multer from "multer"


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

export const upload = multer({
     storage, 
    
})