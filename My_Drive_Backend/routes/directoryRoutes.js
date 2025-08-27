
import express from "express";
import {  rm, writeFile } from "fs/promises";
// import path, { dirname } from "path"
import foldersData from "../directoryDB.json" with {type: "json"}
import filesData from "../filesDB.json" with {type: "json"}


const router = express.Router()



router.get("/:id?", async (req, res) => {
  const  id  = req.params.id || foldersData[0].id;

  // pick root or specific folder
  const directoryData = foldersData.find((folder) => folder.id === id) 
    

  if (!directoryData) {
    return res.status(404).json({ message: "Directory Data not found" });
  }

  // resolve files safely
  const files = directoryData.files
    .map((fileId) => filesData.find((file) => file.id === fileId))
    .filter(Boolean); // removes undefined if file not found

  // resolve sub-directories safely, return only {id, dirname}
  const directories = directoryData.directories
    .map((folderId) => foldersData.find((folder) => folder.id === folderId))
    .filter(Boolean)
    .map(({ id, dirname }) => ({ id, dirname }));

  return resstatus(200).json({ ...directoryData, files, directories });
});



router.post("/:parentDirId?", async (req, res) => {
  const dirname = req.headers.dirname || "New Folder"
  const parentDirId = req.params.parentDirId || foldersData[0].id
  
    const dirId = crypto.randomUUID();
    foldersData.push({id:dirId,dirname,parentDir:parentDirId,files:[],directories:[]})
    const parentFolder = foldersData.find((folder)=>folder.id === parentDirId)

    if(!parentFolder){
      return res.status(404).json({message:"Parent Directory Not Found"})
    }
    parentFolder.directories.push(dirId);

try {
    await writeFile('./directoryDB.json',JSON.stringify(foldersData))
    res.status(200).json({ message: "Directory Created!" });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

router.patch("/:parentDirId",(req,res,next)=>{
     const {parentDirId} = req.params
     const directory = foldersData.find((folder)=>folder.id === parentDirId)
     if(!directory){
      res.status(404).json({message:"Directory Not Found"})
     }
     directory.dirname=  req.body.newDirName
     try{
        writeFile("./directoryDB.json",JSON.stringify(foldersData))
     }
     catch(err){
      next(err)
     }
    
     res.status(200).json({message:"Directory Renamed"})

})

router.delete("/:id",async(req,res,next)=>{
  const {id} = req.params
  try{

    const directoryIndex  = foldersData.findIndex((directory)=>directory.id === id);
    
    //  if (directoryIndex === -1) {
    //   return res.status(404).json({ error: "Directory not found" });
    // }

    const directoryDatas = foldersData[directoryIndex]

    foldersData.splice(directoryIndex,1);

    for await (const filesId of directoryDatas.files){
      const fileIndex = filesData.findIndex((file)=>file.id === filesId)
      const fileData = filesData[fileIndex]
      await rm(`./storage/${fileData.id}${fileData.extension}`,{recursive:true})
      filesData.splice(fileIndex,1);
    }

    for await (const dirId of directoryDatas.directories){
         const dirIndex = foldersData.findIndex((directory)=>directory.id === dirId)
         foldersData.splice(dirIndex,1)
    }

    const parentDirId = directoryDatas.parentDir
    const parentDirData  = foldersData.find((folder)=>folder.id === parentDirId)
    parentDirData.directories = parentDirData.directories.filter((folderId)=>folderId !== id);

    await writeFile('./filesDB.json',JSON.stringify(filesData))
    await writeFile('./directoryDB.json',JSON.stringify(foldersData))

    res.status(200).json({message:"Directory Deleted"});


  }
  catch(err){
    next(err)
  }
})

export default router