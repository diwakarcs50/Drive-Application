import express from "express";
import { createWriteStream, write } from "fs";
import { rename, rm, writeFile } from "fs/promises";
import path from "path";
import filesData from "../filesDB.json" with {type:"json"}
import directoryData from "../directoryDB.json" with {type:"json"}


console.log(filesData)

// Create
const router = express.Router()

router.post("/:filename", (req, res) => {
  const {filename} = req.params
  const extension = path.extname(filename)
  console.log(filename)
  const id = crypto.randomUUID()
  const fullFileName = `${id}${extension}`
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);


  req.on("end", async() => {
    filesData.push({id:id,extension:extension,name:filename})
    console.log(filesData)
    await writeFile('./filesDB.json',JSON.stringify(filesData))
    res.json({ message: "File Uploaded" });
  });
  
});

router.get("/:fileId", (req, res) => {
  const {fileId} = req.params
  const myFile = filesData.find((data)=>data.id === fileId)
  
  console.log(myFile)
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${process.cwd()}/storage/${fileId}${myFile.extension}`);
});

// Update
router.patch("/:fileId", async (req, res) => {
  const {fileId} = req.params;
  const myFile = filesData.find((file)=>file.id === fileId)
  myFile.name = req.body.newFilename

  await writeFile('./filesDB.json',JSON.stringify(filesData))
  res.json({message:"Renamed"})

});

// Delete
router.delete("/:id", async (req, res) => {
  const {id} = req.params;
  const fileIndex = filesData.findIndex((file) => file.id === id)
  const fileData = filesData[fileIndex];
  const extension = fileData.extension

  try {
    await rm(`./storage/${id}${extension}`, { recursive: true });
    filesData.splice(fileIndex,1);
    const dir =  directoryData.find((folder)=>folder.id === fileData.parentDirId)
    dir.files = dir.files.filter((fileId)=>fileId !== id);
    await writeFile('./filesDB.json',JSON.stringify(filesData))
    await writeFile('./directoryDB.json',JSON.stringify(directoryData))

    res.json({ message: "File Deleted Successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

export default router