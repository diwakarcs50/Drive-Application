# 📂 Drive Application

A **Google Drive–like application** built using **Node.js, Express, and MongoDB**.  
This app allows users to upload, organize, and manage files/folders, with secure storage and CRUD operations.

---

## 🚀 Features
- User authentication (login/signup with JWT or sessions)  
- Create, read, update, and delete (CRUD) files & folders  
- Upload documents, images, and other file types  
- Hierarchical folder structure (nested directories)  
- MongoDB for storing metadata (file name, type, parent folder, etc.)  
- Express backend API for handling requests  
- RESTful routes for easy integration with frontend  

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose ODM)  
- **Storage:** Local storage / GridFS (for large files)  
- **Authentication:** JWT / Passport.js  

---

## 📂 Project Structure

---

## ⚙️ Installation & Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/drive-app.git
   cd drive-app
npm install


```
PORT=4000
MONGO_URI=mongodb://localhost:27017/driveApp
JWT_SECRET=your-secret-key
```
