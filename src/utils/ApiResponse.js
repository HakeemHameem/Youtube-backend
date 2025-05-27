
/*This ApiResponse class is the opposite of your ApiError class
it’s used to send successful API responses in a consistent format. */

/*This class helps you standardize all your successful responses*/


//Example
/* res.status(200).json(new ApiResponse(200, { name: "Hameem" }, "User fetched"))

{
  "statusCode": 200,
  "data": {
    "name": "Hameem"
  },
  "message": "User fetched",
  "success": true
}*/


class ApiResponse{
      
    constructor(statusCode , data , message = "Success" ,){
        this.statusCode = statusCode //Stores the HTTP status code.
        this.data = data //Holds the actual data being returned from the API.
        this.message = message //A human-readable message. Useful to show status like "User created" or "Fetched successfully".
        this.success = statusCode < 400 // Status Codes less than 400 i,e success otherwise error
    }
}

















