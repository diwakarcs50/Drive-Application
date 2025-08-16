import express from "express";
import { createWriteStream } from "fs";
import { rename, rm } from "fs/promises";




// Create
const router = express.Router()

router.post("/*", (req, res) => {
  const writeStream = createWriteStream(`./storage/${req.params[0]}`);
  req.pipe(writeStream);
  req.on("end", () => {
    res.json({ message: "File Uploaded" });
  });
});

router.get("/*", (req, res) => {
  const { 0: filePath } = req.params;
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${process.cwd()}/storage/${filePath}`);
});

// Update
router.patch("/*", async (req, res) => {
  const { 0: filePath } = req.params;
  await rename(`./storage/${filePath}`, `./storage/${req.body.newFilename}`);
  res.json({ message: "Renamed" });
});

// Delete
router.delete("/*", async (req, res) => {
  const { 0: filePath } = req.params;
  try {
    await rm(`./storage/${filePath}`, { recursive: true });
    res.json({ message: "File Deleted Successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

export default router