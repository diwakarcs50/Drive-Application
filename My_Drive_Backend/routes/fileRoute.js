import express from "express";
import { createWriteStream, write } from "fs";
import { rename, rm, writeFile } from "fs/promises";
import path from "path";
import filesData from "../filesDB.json" with {type: "json"}
import directoryData from "../directoryDB.json" with {type: "json"}
import { Db, ObjectId } from "mongodb";


console.log(filesData)

// Create
const router = express.Router()

router.post("/:parentDirId?", async(req, res) => {
  const db= req.db
  const user = req.user
  const parentDirId = req.params.parentDirId ? new ObjectId(String(req.params.parentDirId)) : '' || user.rootDirId;
  const filename = req.headers.filename || 'untitled'
 

  const parentDir = await db.collection('directories').findOne({_id:new ObjectId(String(parentDirId)),userId:user._id})


  if(!parentDir){
    return res.status(404).json({error:"Parent Directory Not Found"})
  }
  const extension = path.extname(filename)
  const file = await db.collection('files').insertOne({extension:extension,name:filename,parentDirId:parentDirId})
  const fullFileName = `${file.insertedId.toString()}${extension}`
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);

  req.on("end", () => {
      return res.status(201).json({ message: "File Uploaded" });
  });
  req.on('error',async()=>{
    await db.collection('files').deleteOne({_id:file.insertedId})
    return res.status(404).json({error:"Interupted while upload"})
  })

});

router.get("/:fileId", async(req, res) => {

  const { fileId } = req.params 
  const db = req.db
  const user = req.user
  console.log("process",process.cwd())

  const file = await db.collection('files').findOne({_id:new ObjectId(String(fileId))})
  const parentId = file.parentDirId


  //Chat GPT se liya hua validation
    if (!ObjectId.isValid(fileId)) {
    return res.status(400).json({ error: "Invalid file ID format" });
  }
  //


   if (file === null) {
    return res.status(404).json({ message: "File Not Found" })
  }


  const parentDirectory = await db.collection('directories').findOne({_id:parentId})
  if(parentDirectory.userId.toString() !== user._id.toString()){
   
    return res.status(401).json({error:"You do not have access to this file"})
  }


  if (req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename=${file.name}`);
  }
  return res.sendFile(`${process.cwd()}/storage/${fileId}${file.extension}`, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ message: "File Not Found" })
    }
  });

});

// Update
router.patch("/:fileId", async (req, res, next) => {
  const { fileId } = req.params;
  console.log("Renaming filr id",fileId)
  const db = req.db;
  const newName = req.body.newFilename;
  

  try {

    const file = await db.collection('files').findOne({_id:new ObjectId(fileId)})
    console.log("renaming file",file)

    const result = await db.collection("files").updateOne(
      { _id: new ObjectId(fileId) },
      { $set: { name: newName } }
    );


    res.json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
});

// Delete
router.delete("/:id", async (req, res,next) => {
  const id  = req.params.id ? new ObjectId((req.params.id)) : ''
  const user = req.user
  const db = req.db

  const file = await db.collection('files').findOne({_id:id})

  if(file === null){
    res.status(404).json({error:"File Not Found"})
  }
  const extension = file.extension
  try { 
    await db.collection('files').deleteOne({_id:new ObjectId(String(id))})
    await rm(`./storage/${id}${extension}`, { recursive: true });
    res.json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err)
  }
});

export default router