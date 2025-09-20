// src/components/FileUpload/FileUpload.jsx
import React from "react";
import "./FileUpload.css";

const FileUpload = ({
  file,
  fileName,
  error,
  onFileChange,
  onDragOver,
  onDrop,
  onUpload,
}) => {
  return (
    <div className="upload-section fade-in">
      <div className="upload-container" onDragOver={onDragOver} onDrop={onDrop}>
        <div className="upload-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
              fill="#2563eb"
            />
            <path d="M14 2V8H20" fill="#1e40af" />
            <path
              d="M16 13H8V11H16V13ZM16 17H8V15H16V17ZM13 9H8V7H13V9Z"
              fill="white"
            />
          </svg>
        </div>
        <h2>Upload Configuration File</h2>
        <p>
          Select your Palo Alto XML configuration file to begin compliance
          analysis
        </p>

        <div className="file-input-container">
          <label htmlFor="file-upload" className="file-input-label">
            <span className="file-input-button">Choose File</span>
            <span className="file-input-text">
              {fileName || "No file chosen"}
            </span>
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".xml"
            onChange={onFileChange}
            className="file-input-hidden"
          />
        </div>

        <button onClick={onUpload} disabled={!file} className="upload-btn">
          Upload and Analyze
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default FileUpload;
