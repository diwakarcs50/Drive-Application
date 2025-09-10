import express from "express";
import cors from "cors";

import directoryRoute from "./routes/directoryRoutes.js";
import fileRoute from "./routes/fileRoute.js";
import userRoute from "./routes/userRoutes.js"
import cookieParser from "cookie-parser";
import checkAuth from "./Auth.js";
import { connectDb } from "./database.js";


try{
  
const db = await connectDb()
const app = express();


app.use(express.json());
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}));
app.use(cookieParser())

app.use((req,res,next)=>{
    req.db = db
    next()
})

app.use("/directory", checkAuth, directoryRoute)
app.use("/file",checkAuth, fileRoute)
app.use("/user",userRoute)



app.use((err,req,res,next)=>{
  res.status(err.status || 500).json({message:"Somnething went wrong"})
})


app.listen(4000, () => {
  console.log(`Server Started`);
});


}catch(err){
   console.log("Database Connection Error")
   console.log(err)
}

