var jwt=require("jsonwebtoken");
const JWT_STOKEN='SecretCode';
const fetchuser =(req ,res,next)=>{
    const  token = req.header("auth-token");
    if(!token){
        res.status(401).send({error:"please authenticate using a valid token"})
    }
   try {
    const data=jwt.verify(token,JWT_STOKEN);
    req.user=data.user
    next();
   } catch (error) {
    console.error(error.message);
    res.status(401).send({error:"please authenticate using a valid token"})
   }

}
module.exports=fetchuser;