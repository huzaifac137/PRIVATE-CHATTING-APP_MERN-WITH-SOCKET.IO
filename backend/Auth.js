const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth =(req , res ,next)=>
{
   
    const sentToken = req.headers.authorization;

    const token = sentToken.split("mjfcmjbl")[1];

  

  let extractedToken;

  try
  {
     extractedToken =  jwt.verify(token , process.env.JWT_KEY);
  }

  catch(err)
  {
    const error = new Error("SOMETHING WENT WRONG ");
    console.log(err);
    error.code =500;
    return next(error);
  }

   console.log("AUTHENTICATED");
  req.extractedUserId = extractedToken.userId;
  req.extractedUsername = extractedToken.username;

  next();


};

module.exports = auth;