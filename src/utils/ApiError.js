/* 🔄 Why use ApiError?
Because instead of sending random error messages everywhere, you now return 
a consistent error format from all routes, making it easier to debug and 
build frontends. */

//Example 
/* throw new ApiError(404, "User not found", ["No user with that ID"])

{
  statusCode: 404,
  data: null,
  message: "User not found",
  success: false,
  errors: ["No user with that ID"]
} */




class ApiError extends Error{

    constructor(
       statusCode,  // e.g., 404, 500 — HTTP status codes
       message = 'Something went Worng',  // error message (default: "Something went Wrong")
       errors = [],   // an array of specific error details (default: empty array)
       stack = "" // optional stack trace (default: empty string)
    ){
        super(message) //This calls the constructor of the parent Error class and sets the default error message.
        this.statusCode = statusCode //Custom field: stores the HTTP status code like 404, 500, etc.
        this.data = null //This API always returns a structure, and data is set to null in case of error.
        this.message = message //Although super(message) already sets the message, it's repeated here for clarity/access in your custom object.
        this.success = false  //Indicates that the API call failed.
        this.errors = errors //Stores additional error info like validation issues, etc. example when submitting a form or something

        if(stack) {   //If a stack trace is provided, it uses that. Otherwise, it captures the current stack trace automatically.
            this.stack = stack
        }else{
            Error.captureStackTrace(this , this.constructor)
        }

    }
}

export {ApiError}