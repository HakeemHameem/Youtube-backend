const asyncHandler = (requestHandler) => { // we are using asyncHandler so that we dont have to write the async code again and again we just have to pass the function in it and just use it anywhere
    (req , res ,  next) => {
        Promise.resolve(requestHandler(req , res , next)).  // promise ya tou resolve ya tou Fail
        catch((err) => next(err))

    }

}

export {asyncHandler}
























// Other methods

// const asyncHandler = (fn) => async (req , res ,next) => {
//     try {
//         await fn(req , res ,next)
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success : false,
//             message : err.message
//         })
        
//     }


// }

// export {asyncHandler}