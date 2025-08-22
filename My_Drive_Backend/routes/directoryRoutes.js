
import express from "express";
import { mkdir, readdir, stat } from "fs/promises";
import path from "path"
import foldersData from "../directoryDB.json" with {type: "json"}
import filesData from "../filesDB.json" with {type: "json"}

const router = express.Router()



router.get("/:id?", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    const directoryData = foldersData[0]
    const files = directoryData.files.map((fileId) =>
      filesData.find((file) => file.id === fileId)
    )

    res.json({...directoryData,files})
  }
  else {
    const directoryData = foldersData.find((folder) => folder.id === req.params.id);
    const files = directoryData.files.map((fileId) =>
      filesData.find((file) => file.id === fileId)
    )

    res.json({...directoryData,files})
  
  }



});


router.post("/?*", async (req, res) => {
  const { 0: dirname } = req.params;
  try {
    await mkdir(`./storage/${dirname}`);
    res.json({ message: "Directory Created!" });
  } catch (err) {
    res.json({ err: err.message });
  }
});

export default router