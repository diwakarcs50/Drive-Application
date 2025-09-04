import express from "express";
import { createWriteStream, write } from "fs";
import { rename, rm, writeFile } from "fs/promises";
import path from "path";
import filesData from "../filesDB.json" with {type: "json"}
import directoryData from "../directoryDB.json" with {type: "json"}


console.log(filesData)

// Create
const router = express.Router()

router.post("/:parentDirId?", (req, res) => {
  const user = req.user
  const parentDirId = req.params.parentDirId || user.rootDirId;
  const filename = req.headers.filename || 'untitled'

  console.log(parentDirId)
  const extension = path.extname(filename)
  console.log(filename)
  const id = crypto.randomUUID()
  const fullFileName = `${id}${extension}`
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);


  req.on("end", async () => {
    filesData.push({ id: id, extension: extension, name: filename, parentDirId: parentDirId })
    console.log(filesData)
    const parentDirectory = directoryData.find((folder) => folder.id === parentDirId)
    parentDirectory.files.push(id)


    try {
      await writeFile('./filesDB.json', JSON.stringify(filesData))
      await writeFile('./directoryDB.json', JSON.stringify(directoryData))
      return resstatus(201).json({ message: "File Uploaded" });
    } catch (err) {
      return res.status(500).json({ message: "FILE NOT SAVED!" })
    }


  });

});

router.get("/:fileId", (req, res) => {

  
  const { fileId } = req.params
  const myFile = filesData.find((data) => data.id === fileId)


  const parentDirectory = directoryData.find((folder)=>folder.id === myFile.parentDirId)
  if(parentDirectory.userId !== req.user.userId){
    return res.status(401).json({error:"You do not have access to this file"})
  }


  if (!myFile) {
    return res.status(404).json({ message: "File Not Found" })
  }

    //checking if file belongs to the user
  // const user = req.user
  // const rootDir  = directoryData.find((folder)=>folder.id === user.rootDirId)
  // const index = rootDir.files.findIndex((file)=>file === fileId)
  // if(index === -1){
  //   return res.status(401).json({message:"Unauthorised Access"})
  // }


  if (req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename=${myFile.name}`);
  }
  return res.sendFile(`${process.cwd()}/storage/${fileId}${myFile.extension}`, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ message: "File Not Found" })
    }
  });

});

// Update
router.patch("/:fileId", async (req, res,next) => {
  const { fileId } = req.params;
  const myFile = filesData.find((file) => file.id === fileId)
  myFile.name = req.body.newFilename

  try{
      await writeFile('./filesDB.json', JSON.stringify(filesData))
       res.json({ message: "Renamed" })
  }catch(err){
    err.status = 500
     next(err)
  }
 

});

// Delete
router.delete("/:id", async (req, res,next) => {
  const { id } = req.params;
  const fileIndex = filesData.findIndex((file) => file.id === id)
  if(fileIndex === -1){
    return res.status(404).json({message:"File not found while deleting"})
  }
  const fileData = filesData[fileIndex];
  const extension = fileData.extension

  try {
    await rm(`./storage/${id}${extension}`, { recursive: true });
    filesData.splice(fileIndex, 1);
    const dir = directoryData.find((folder) => folder.id === fileData.parentDirId)
    dir.files = dir.files.filter((fileId) => fileId !== id);
    await writeFile('./filesDB.json', JSON.stringify(filesData))
    await writeFile('./directoryDB.json', JSON.stringify(directoryData))
    res.json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err)
  }
});

export default router