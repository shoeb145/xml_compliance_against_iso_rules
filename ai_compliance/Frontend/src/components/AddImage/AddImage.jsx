import React, { useRef, useState } from "react";

function AddImage(props) {
  const fileInputRef = useRef(null);
  const [dBtn, setDBtn] = useState(true);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const [status, setStatus] = useState(false);

  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleFileChange = (e) => {
    setDBtn(false);
    const selectedFile = e.target.files[0];
    if (!selectedFile) setDBtn(true);
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
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

    setStatus(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      //   const response = await axios.post(`${API_BASE}/uploadImage`, formData);
      console.log("file is uploding...");
    } catch (err) {
      setError("Upload failed: " + (err.response?.data?.error || err.message));
      setStatus(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className=" w-full  mx-96 border border-zinc-50 h-4 mt-5 rounded-xl  flex justify-between items-center  p-9 py-7">
        <input
          className="cursor-pointer rounded-md hover:opacity-90"
          type="file"
          ref={fileInputRef}
          name=""
          id=""
          onChange={(e) => handleFileChange(e)}
        />
        <button
          disabled={dBtn}
          //   onClick={uploadFile}
          className={`h-8 w-40  rounded-md ${
            dBtn
              ? "bg-slate-500"
              : "bg-gradient-to-r from-[#5c33ff] to-[#03f9b3]"
          }`}
        >
          Upload and Analyze
        </button>
      </div>
    </div>
  );
}

export default AddImage;
