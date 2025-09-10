import express from 'express'
import usersData from "../usersDB.json" with {type: "json"}
import directoryData from "../directoryDB.json" with {type:"json"}
import {writeFile} from 'fs/promises'
import checkAuth from '../Auth.js'

const router = express.Router()

router.post("/register",async(req,res,next)=>{
    
    const {username,email,password} = req.body

    const emailData  = usersData.find((user)=>user.email === email)
    if(emailData){
        return res.status(409).json({error:"User already exist",message:"Email Already Taken"})
    }
     const userId = crypto.randomUUID()
    const dirId = crypto.randomUUID()

    usersData.push({userId,name:username,email,password,rootDirId:dirId})
// {id:dirId,dirname,parentDir:parentDirId,files:[],userId:user.userId,directories:[]}
    directoryData.push({id:dirId,dirname:`root-${email}`,userId,parentDir:null,files:[],directories:[]})
    console.log(usersData)
    console.log(directoryData)

    try{
         await writeFile('./usersDB.json',JSON.stringify(usersData))
         await writeFile('./directoryDB.json',JSON.stringify(directoryData))
         res.status(201).json({message:"User created"})
    }catch(err){
        console.log("Exception while writing");
        next(err)
    }

    
})


router.post("/login",(req,res,next)=>{
    const {email,password} = req.body
    const user = usersData.find((user)=>user.email === email)
    if(!user || user.password !== password){
        return res.status(404).json({error:"Invalid Credentials"})
    }

    res.cookie('uid',user.userId,{
        httpOnly:true,
        maxAge: 60 * 1000 * 60 * 24 * 7
    })
   
    const check = user.email === email && user.password === password
    console.log(req.body)
    res.json({message:"User Logged in"})
})

router.get("/", checkAuth,(req,res,next)=>{
 
        res.status(200).json({
            name:req.user.name,
            email:req.user.email
        })

})

router.post("/logout",checkAuth,(req,res)=>{
    res.clearCookie('uid')
    // res.cookie('uid','',{
    //     maxAge:0
    // })
    res.status(200).json({message:"Logged out Successfully"})
})
export default router


// C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg" --service