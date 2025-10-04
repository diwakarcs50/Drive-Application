import express from 'express'
import checkAuth from '../Auth.js'
import { ObjectId } from 'mongodb'
import { client } from '../config/database.js'
import crypto, { pbkdf2, pbkdf2Sync } from 'node:crypto'

const router = express.Router()
export const mySecretKey = "StorageApp"

router.post("/register", async (req, res, next) => {

    const db = req.db

    const {
        username,
        email,
        password
    } = req.body

    // const hashedPassword = crypto.createHash('sha256').update(password).digest('base64url')
    const salt =  crypto.randomBytes(16)
    const hashedPassword =  pbkdf2Sync(password,salt,100000,32,'sha256')


   
    const emailData = await db.collection('users').findOne({email:email})
   

    if (emailData !== null) {
        return res.status(409).json({
            error: "User already exist",
            message: "Email Already Taken"
        })
    }
    const directoryId = new ObjectId()
    const uId = new ObjectId()


    const session = client.startSession()
    try{

        session.startTransaction()


        const userRootDir = await db.collection('directories').insertOne({
        _id:directoryId,
        dirname: `root-${email}`,
        parentDir: null,   
        userId:uId 
    },{session})

    
    const createdUser = await db.collection('users').insertOne({
        _id:uId,
        username,
        email,
        password:`${hashedPassword.toString('base64url')}.${salt.toString('base64url')}`,
        rootDirId:directoryId
    },{session})

    session.commitTransaction()

  }catch(err){
    session.abortTransaction()
    if(err.code === 121){
        return res.status(400).json({
            error:"Invalid fields",
            details:err.message,
        })
    }
    next(err)
  }

    res.status(201).json({
        message: "User created"
    })

})


router.post("/login", async(req, res, next) => {
    const db = req.db
    const {
        email,
        password
    } = req.body


    const user  = await db.collection('users').findOne({email:email})
      if(!user){
        return res.status(404).json({error:"Invalid Credentials"})
     }

     const [passwordHash,salt] = user.password.split(".")
    // const newPasswordHash = crypto.createHash('sha256').update(password).digest('base64url')
    console.log("salt" ,salt)
    const buff = Buffer.from(salt,'base64url')

    const newPasswordHash = pbkdf2Sync(password,buff,100000,32,'sha256').toString("base64url")
    console.log("new" , newPasswordHash)
    console.log("old" , passwordHash)


    // console.log(user)
     if(passwordHash !== newPasswordHash){
        return res.status(404).json({error:"Invalid Credentials"})
     }

     const cookieData = JSON.stringify({
        expiryTime : Date.now() + 60 * 60 * 24,
        userId : user._id.toString()
     })


    const base64 =  Buffer.from(cookieData).toString("base64url")
    // console.log("Base64" , base64)

    const hash = crypto.createHash('sha256').update(cookieData).update(mySecretKey).digest('base64url')
    console.log("Hash" ,hash)


    const payload = `${base64}.${hash}`

 
     res.cookie("token",payload,{
        httpOnly:true,
        maxAge: 1000 * 60 * 60 * 24 * 7
     })


    //  res.cookie('uid',user._id.toString() + Math.round(Date.now()/1000 + (60 * 60 * 24)).toString('16'),{
    //     httpOnly:true,
    //     maxAge: 1000 * 60 * 60 * 24 * 7
    //  })
    //  console.log(user._id)

    res.json({
        message: "User Logged in"
    })
})

router.get("/", checkAuth, (req, res, next) => {

    res.status(200).json({
        name: req.user.name,
        email: req.user.email
    })

})

router.post("/logout", checkAuth, (req, res) => {
    res.clearCookie('uid')
    return res.status(200).json({
        message: "Logged out Successfully"
    }).end()
})

export default router


// C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg" --service