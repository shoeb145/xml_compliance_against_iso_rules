import React, { useRef, useState } from "react";
import axios from "axios";

function AddImage({ data, taskId, onImageUpload, maindata, setLoading }) {
  const fileInputRef = useRef(null);
  const [dBtn, setDBtn] = useState(true);
  const [file, setFile] = useState(null);

  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleFileChange = (e) => {
    setDBtn(false);
    const selectedFile = e.target.files[0];
    if (!selectedFile) setDBtn(true);
    setFile(selectedFile);

    setError("");
  };

  // const handleDragOver = (e) => {
  //   e.preventDefault();
  // };

  // const handleDrop = (e) => {
  //   e.preventDefault();
  //   const droppedFile = e.dataTransfer.files[0];
  //   if (droppedFile && droppedFile.name.endsWith(".xml")) {
  //     setFile(droppedFile);
  //     setFileName(droppedFile.name);
  //   } else {
  //     setError("Please upload an XML file");
  //   }
  // };

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }
    setDBtn(false);

    setLoading((prev) => ({ ...prev, [data.control_name]: true }));
    setError("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("task_id", taskId);
    formData.append("control_id", data.control_id);
    formData.append("control_name", data.control_name);
    formData.append("control_description", data.control_description);
    formData.append("current_status", data.status);

    try {
      const response = await axios.post(`${API_BASE}/recheck-rule`, formData);

      setResults(response);
      setFile("");

      onImageUpload(response.data);
      setLoading((prev) => ({ ...prev, [data.control_name]: false }));
    } catch (err) {
      setLoading((prev) => ({ ...prev, [data.control_name]: false }));
      setError("Upload failed: " + (err.response?.data?.error || err.message));
      setStatus(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className=" w-full  mx-96 border border-zinc-50 h-4 mt-5 rounded-xl gap-2  flex justify-between items-center px-5 py-7">
        <input
          className="cursor-pointer rounded-md hover:opacity-90"
          type="file"
          ref={fileInputRef}
          name=""
          id=""
          accept="image/*"
          onChange={(e) => handleFileChange(e)}
        />
        <button
          disabled={dBtn}
          onClick={uploadFile}
          className={`h-8 w-40  rounded-md ${
            dBtn
              ? "bg-slate-500"
              : "bg-gradient-to-r from-[#5c33ff] to-[#03f9b3]"
          }`}
        >
          Upload and Analyze
        </button>
      </div>
      {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
    </div>
  );
}

export default AddImage;
