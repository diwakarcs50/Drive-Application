import express from 'express'
import checkAuth from '../Auth.js'

const router = express.Router()

router.post("/register", async (req, res, next) => {

    const db = req.db

    const {
        username,
        email,
        password
    } = req.body

   
    const emailData = await db.collection('users').findOne({email:email})
   

    if (emailData !== null) {
        return res.status(409).json({
            error: "User already exist",
            message: "Email Already Taken"
        })
    }


    const userRootDir = await db.collection('directories').insertOne({
        dirname: `root-${email}`,
        parentDir: null,    
    })

    const rootDirId = userRootDir.insertedId

    const createdUser = await db.collection('users').insertOne({
        username,
        email,
        password,
        rootDirId
    })

    const userId = createdUser.insertedId

    await db.collection('directories').updateOne({_id:rootDirId},{$set:{userId}})


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

    const user  = await db.collection('users').findOne({email:email,password})
    // console.log(user)
     if(user === null ){
        return res.status(404).json({error:"Invalid Credentials"})
     }

     res.cookie('uid',user._id.toString(),{
        httpOnly:true,
        maxAge: 1000 * 60 * 60 * 24 * 7
     })
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
    res.status(200).json({
        message: "Logged out Successfully"
    }).end()
})
export default router


// C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg" --service