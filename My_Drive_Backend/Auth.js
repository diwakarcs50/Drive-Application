 import { ObjectId } from "mongodb"

 export default async function checkAuth(req,res,next){

  const db = req.db
  
  const uid = req.cookies.uid
  console.log("UID",uid)


  const user = await db.collection('users').findOne({_id:new ObjectId(uid)})
  console.log("user",user)

  if(!uid || user === null ){
    return res.status(401).json({error:"Please Login"})
  }
  req.user = user
  next()
 }
  
