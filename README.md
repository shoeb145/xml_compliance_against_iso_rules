# Palo Alto XML Compliance Checker (ISO Controls)

This project provides an **AI-powered compliance checker** for Palo Alto firewall XML configuration files against a fixed set of **ISO controls**.  
It parses XML configurations, maps them to ISO rules from a CSV checklist, and uses AI to analyze compliance.

The tool is built with:

- **Backend** → Python (Flask, OpenAI API, XML/CSV parsing)
- **Frontend** → React + Vite (UI for uploading files and viewing results)

---

## 📂 Project Structure

```
ai_compliance/
│── Backend/
│   ├── main.py               # Entry point for backend server
│   ├── compliance.py         # AI compliance logic
│   ├── xml_parser.py         # Palo Alto XML parser
│   ├── iso_loader.py         # ISO checklist loader
│   ├── tasks_progress.py     # Background task tracking
│   ├── requirements.txt      # Backend dependencies
│   └── iso_controls.csv      # Fixed ISO rules (120 entries)
│
│── Frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React app
│   │   └── ...               # Components
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite config
│
└── README.md
```

---

## 🚀 Features

- Parse large Palo Alto XML config files efficiently
- Load ISO control checklist from CSV (fixed 120 rules)
- Group XML entries by ISO control or "others"
- AI-powered compliance evaluation using Falcon/OpenAI models
- Web interface to upload files and view results
- Background task tracking with progress updates

---

## ⚙️ Setup Instructions

### 🔹 1. Clone Repository

```bash
git clone https://github.com/Shrenik027/xml_compliance_against_iso_rules.git
cd ai_compliance
```

---

### 🔹 2. Backend Setup (Flask + Python)

1. Navigate to backend folder:

   ```bash
   cd Backend
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file and add your OpenAI/Hugging Face API key:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the backend:

   ```bash
   python main.py
   ```

   Backend runs on: **http://localhost:5000**

---

### 🔹 3. Frontend Setup (React + Vite)

1. Navigate to frontend folder:

   ```bash
   cd ../Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the frontend:

   ```bash
   npm run dev
   ```

   Frontend runs on: **http://localhost:5173**

---

### 🔹 4. Running the Project

- Open the frontend in your browser.
- Upload:
  - Palo Alto XML file
  - ISO controls CSV (already provided in `Backend/iso_controls.csv`)
- View compliance results grouped by ISO control.

---

## 📑 Requirements

### Backend

See `Backend/requirements.txt`:

```
flask
flask-cors
python-dotenv
openai
```

### Frontend

From `Frontend/package.json`:

```
react
react-dom
vite
axios
```

---

## 👥 Contributing

- Use feature branches (`feature-xyz`)
- Submit Pull Requests for review
- Ensure commits follow the company’s guidelines

---
