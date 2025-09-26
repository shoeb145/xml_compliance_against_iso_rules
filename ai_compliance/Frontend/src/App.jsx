// src/App.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "./components/Header/Header";
import FileUpload from "./components/FileUpload/FileUpload";
import ProcessingStatus from "./components/ProcessingStatus/ProcessingStatus";
import Results from "./components/Results/Results";
import Error from "./components/Error/Error";
import "./App.css";
import NavBar from "./components/NavBar/NavBar";

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [currentRule, setCurrentRule] = useState("");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".xml")) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    } else {
      setError("Please upload an XML file");
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE}/upload`, formData);
      setTaskId(response.data.task_id);
      setStatus("processing");
      setProgress(0);
      setMessage("Initializing analysis...");
    } catch (err) {
      setError("Upload failed: " + (err.response?.data?.error || err.message));
      setStatus("idle");
    }
  };

  useEffect(() => {
    let intervalId = null;

    if (status === "processing" && taskId) {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE}/task/${taskId}`);
          const data = response.data;

          setProgress(data.progress);
          setCurrentRule(data.current_rule);
          setMessage(data.message);

          if (data.status === "completed") {
            setStatus("completed");
            setResults(data.result);
            clearInterval(intervalId);
          } else if (data.status === "error") {
            setError(data.error || "Processing error");
            setStatus("error");
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Status check failed:", err);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, taskId]);

  const reset = () => {
    setFile(null);
    setFileName("");
    setTaskId(null);
    setStatus("idle");
    setProgress(0);
    setCurrentRule("");
    setMessage("");
    setResults(null);
    setError("");
  };

  return (
    <div className="app">
      {/* Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="orb orb-4"></div>

      <NavBar />

      <Header />

      <main className="app-content">
        {status === "idle" && (
          <FileUpload
            file={file}
            fileName={fileName}
            error={error}
            onFileChange={handleFileChange}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onUpload={uploadFile}
          />
        )}

        {status === "uploading" && (
          <div className="status fade-in">
            <div className="processing-spinner"></div>
            <p>Uploading configuration file...</p>
          </div>
        )}

        {status === "processing" && (
          <ProcessingStatus
            progress={progress}
            currentRule={currentRule}
            message={message}
          />
        )}

        {status === "completed" && results && (
          <Results results={results} onReset={reset} />
        )}

        {status === "error" && <Error error={error} onReset={reset} />}
      </main>
    </div>
  );
}

export default App;
