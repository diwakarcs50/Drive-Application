 import userData from "./usersDB.json" with {type:"json"}

 export default function checkAuth(req,res,next){
  
  const {uid} = req.cookies
  console.log(uid)
  const user = userData.find((user)=>user.userId === uid)
  if(!uid || !user){
    return res.status(401).json({error:"Please Login"})
  }
  req.user = user
  next()
 }
  
