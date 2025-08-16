import express from "express";
import cors from "cors";

import directoryRoute from "./routes/directoryRoutes.js";
import fileRoute from "./routes/fileRoute.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/directory",directoryRoute)
app.use("/file",fileRoute)
// Read


app.listen(4000, () => {
  console.log(`Server Started`);
});
