
import express from "express";
import {  rm, writeFile } from "fs/promises";


import { Db, ObjectId } from "mongodb";



const router = express.Router()



router.get("/:id?", async (req, res) => {

  const user = req.user
  
  const id= req.params.id? new ObjectId(String(req.params.id)) : '' || user.rootDirId

  const db = req.db
 
  const directoryData = await db.collection('directories').findOne({_id:id,userId:user._id})

    if(!directoryData){
        return res.status(404).json({error:"Directory Not Found"})
    }

  const directories = await db.collection('directories').find({parentDir:id}).toArray()
  console.log(directories)

  const files = await db.collection('files').find({parentDirId:id}).toArray() 


  return res.status(200).json({ ...directoryData, files, directories:directories.map((dir)=>({...dir,id:dir._id})) });
});



router.post("/:parentDirId?", async (req, res,next) => {
  const dirname = req.headers.dirname || "New Folder"
  const user  = req.user 
  const parentDirId = req.params.parentDirId ? new ObjectId(req.params.parentDirId) : '' || user.rootDirId
  const db = req.db
  try{
     const parent = await db.collection('directories').findOne({_id:parentDirId})

   if(!parent){
    return res.status(404).json({error:"Parent Not found"})
   }

  const newDir = await db.collection('directories').insertOne({dirname,parentDir:parentDirId,userId:user._id})
     res.status(201).json({success:"Directory Created"})
  }catch(err){
    next(err)
  }
  }
);

router.patch("/:parentDirId",async(req,res,next)=>{
     const db= req.db
     console.log("USER ",req.user)
     const {parentDirId} = req.params
     const directory = await db.collection('directories').updateOne({_id:new ObjectId(String(parentDirId)),userId:req.user._id},{$set:{dirname:req.body.newDirName}})
     if(!directory){
      res.status(404).json({message:"Directory Not Found"})
     }
     res.status(200).json({message:"Directory Renamed"})

})

router.delete("/:id",async(req,res,next)=>{
  const {id} = req.params
  const db= req.db

  const dir = await db.collection('directories').findOne({_id:new ObjectId(String(id))})

  const directories = []
  
  const parentDirObjId = new ObjectId(id)
  

  async function getDirectoryContents(id,fileCollection,directoryCollection){
    console.log("starting time",new Date().toLocaleTimeString())
    
        const files = await db.collection('files').find({parentDirId:id}).toArray()
        const direc = await db.collection('directories').find({parentDir:id},{projection:{_id:1,dirname:1}}).toArray()
        

        for(const file of files){  
          fileCollection.push(file)
          console.log("orignal name",file.name)
        }
        for( const {_id,dirname} of direc){
          console.log(_id)
          console.log(dirname)
            directoryCollection.push(_id)
            const {files,directories} =  await getDirectoryContents(_id,fileCollection,directoryCollection)
        }

        return {files,direc}
        
  }

  async function deleteFile(fileCollection,fileIdCollection){
    console.log("comming")
    for (const file of fileCollection){
     console.log("yes comming")
     fileIdCollection.push(file._id)
     const id = file._id.toString()
     const extension = file.extension
     console.log("duplicate",`${id}${extension}`)
     await rm(`${process.cwd()}/storage/${id}${extension}`)
  }

  return fileIdCollection
  }

  const fileCollection = []
  const directoryCollection = []
  const fileIdCollection = []
 
  await getDirectoryContents(parentDirObjId,fileCollection,directoryCollection)
  console.log("File coollection reciev",fileCollection)
  console.log("directory collection reciewved",directoryCollection)

  await deleteFile(fileCollection,fileIdCollection)
  console.log(fileIdCollection)
  await db.collection('files').deleteMany({_id:{$in:fileIdCollection}})
  directoryCollection.push(parentDirObjId)
  await db.collection('directories').deleteMany({_id:{$in:directoryCollection}})

   console.log("ending time",new Date().toLocaleTimeString())
   res.status(200).json({message:"Successfully deleted"})
   
})

export default router