import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

function DirectoryView() {
  const BASE_URL = "http://localhost:4000";
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [newDirname, setNewDirname] = useState("");
  const { dirId } = useParams();

  const navigate = useNavigate();

  async function getDirectoryItems() {
    const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`,{credentials:"include"});
    const data = await response.json();
    if(response.status === 401){
        navigate("/login");
        return;
    }
    setDirectoriesList(data.directories);
    setFilesList(data.files);
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirId]);

  async function uploadFile(e) {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/file/${dirId || ""}`, true);
    xhr.withCredentials = true
    xhr.setRequestHeader("filename", file.name);
    xhr.addEventListener("load", () => {
      getDirectoryItems();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(2));
    });
    xhr.send(file);
  }

  async function handleDelete(id) {
    const response = await fetch(`${BASE_URL}/file/${id}`, {
      method: "DELETE",
      credentials:"include"
    });
    await response.text();
    getDirectoryItems();
  }

  async function renameFile(oldFilename) {
    setNewFilename(oldFilename);
  }

  async function saveFilename(id) {
    const response = await fetch(`${BASE_URL}/file/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newFilename: `${newFilename}` }),
    });
    await response.text();
    setNewFilename("");
    getDirectoryItems();
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    const url = `${BASE_URL}/directory/${dirId || ""}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { dirname: newDirname },
      credentials:"include"
    });
    await response.json();
    setNewDirname("");
    getDirectoryItems();
  }

  async function handleRenameDirectory(id) {
    await fetch(`${BASE_URL}/directory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newDirName: `${newFilename}` }),
      credentials:"include"
    });
    setNewFilename("");
    getDirectoryItems();
  }

  async function handleDeleteDirectory(id) {
    await fetch(`${BASE_URL}/directory/${id}`, {
      method: "DELETE",
      credentials:"include"
    });
    getDirectoryItems();
  }

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const cardStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  };

  const navLinkStyle = {
    textDecoration: 'none',
    padding: '10px 18px',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '25px',
    color: '#667eea',
    fontWeight: '500',
    fontSize: '14px',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const inputStyle = {
    padding: '12px 16px',
    border: '2px solid #e1e5e9',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    background: 'white'
  };

  const buttonStyle = {
    padding: '10px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    marginLeft: '8px'
  };

  const itemStyle = {
    background: 'rgba(102, 126, 234, 0.05)',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '12px',
    border: '1px solid rgba(102, 126, 234, 0.1)',
    transition: 'all 0.3s ease'
  };

  const actionButtonStyle = {
    padding: '6px 12px',
    margin: '0 4px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  };

  const progressBarStyle = {
    width: '100%',
    height: '8px',
    background: '#e1e5e9',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px'
  };

  const progressFillStyle = {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    width: `${progress}%`,
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Navigation */}
        <div style={navStyle}>
          <Link to="/register" style={navLinkStyle}>
            📝 Register
          </Link>
          <Link to="/login" style={navLinkStyle}>
            🔑 Login
          </Link>
          <Link to="/logout" style={navLinkStyle}>
            🚪 Logout
          </Link>
          <a href="http://localhost:4000/user" style={navLinkStyle}>
            👤 User
          </a>
        </div>

        <h1 style={{ 
          textAlign: 'center', 
          color: '#2d3748', 
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '30px',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          📂 My Files
        </h1>

        {/* Upload Section */}
        <div style={{ 
          background: 'rgba(102, 126, 234, 0.05)', 
          padding: '20px', 
          borderRadius: '15px',
          marginBottom: '25px',
          border: '2px dashed rgba(102, 126, 234, 0.3)'
        }}>
          <input 
            type="file" 
            onChange={uploadFile}
            style={{
              ...inputStyle,
              width: '100%',
              marginBottom: '10px'
            }}
          />
          {progress > 0 && (
            <div>
              <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#667eea' }}>
                Upload Progress: {progress}%
              </p>
              <div style={progressBarStyle}>
                <div style={progressFillStyle}></div>
              </div>
            </div>
          )}
        </div>

        {/* Rename Input */}
        <input
          type="text"
          onChange={(e) => setNewFilename(e.target.value)}
          value={newFilename}
          placeholder="Enter new name"
          style={{
            ...inputStyle,
            width: '100%',
            marginBottom: '20px'
          }}
        />

        {/* Create Folder */}
        <form onSubmit={handleCreateDirectory} style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              onChange={(e) => setNewDirname(e.target.value)}
              value={newDirname}
              placeholder="New folder name"
              style={{
                ...inputStyle,
                flex: 1
              }}
            />
            <button type="submit" style={buttonStyle}>
              ✨ Create Folder
            </button>
          </div>
        </form>

        {/* Directories */}
        <h2 style={{ color: '#2d3748', fontSize: '24px', marginBottom: '15px' }}>
          📁 Folders
        </h2>
        {directoriesList.map(({ dirname, id }) => (
          <div key={id} style={itemStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '16px' }}>
                {dirname}
              </span>
              <div>
                <Link 
                  to={`/directory/${id}`} 
                  style={{
                    ...actionButtonStyle,
                    background: '#667eea',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  📂 Open
                </Link>
                <button 
                  onClick={() => renameFile(dirname)}
                  style={{
                    ...actionButtonStyle,
                    background: '#f6ad55',
                    color: 'white'
                  }}
                >
                  ✏️ Rename
                </button>
                <button 
                  onClick={() => handleRenameDirectory(id)}
                  style={{
                    ...actionButtonStyle,
                    background: '#48bb78',
                    color: 'white'
                  }}
                >
                  💾 Save
                </button>
                <button 
                  onClick={() => handleDeleteDirectory(id)}
                  style={{
                    ...actionButtonStyle,
                    background: '#f56565',
                    color: 'white'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Files */}
        <h2 style={{ color: '#2d3748', fontSize: '24px', marginBottom: '15px', marginTop: '30px' }}>
          📄 Files
        </h2>
        {filesList.map(({ name, id }) => (
          <div key={id} style={itemStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '16px' }}>
                {name}
              </span>
              <div>
                <a 
                  href={`${BASE_URL}/file/${id}`}
                  style={{
                    ...actionButtonStyle,
                    background: '#667eea',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  👁️ View
                </a>
                <a 
                  href={`${BASE_URL}/file/${id}?action=download`}
                  style={{
                    ...actionButtonStyle,
                    background: '#38b2ac',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  📥 Download
                </a>
                <button 
                  onClick={() => renameFile(name)}
                  style={{
                    ...actionButtonStyle,
                    background: '#f6ad55',
                    color: 'white'
                  }}
                >
                  ✏️ Rename
                </button>
                <button 
                  onClick={() => saveFilename(id)}
                  style={{
                    ...actionButtonStyle,
                    background: '#48bb78',
                    color: 'white'
                  }}
                >
                  💾 Save
                </button>
                <button 
                  onClick={() => handleDelete(id)}
                  style={{
                    ...actionButtonStyle,
                    background: '#f56565',
                    color: 'white'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DirectoryView;