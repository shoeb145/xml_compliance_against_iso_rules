from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import json
from pathlib import Path
from xml_parser import parse_xml
from iso_loader import load_iso_controls
from compliance import run_compliance
import asyncio
from threading import Thread
from tasks_progress import create_task, get_task_status


app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
CSV_FILE = 'iso_controls.csv'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.xml'):
        return jsonify({'error': 'File must be XML'}), 400
    
    # Generate unique task ID
    task_id = str(uuid.uuid4())
    
    # Save uploaded file
    xml_path = os.path.join(UPLOAD_FOLDER, f"{task_id}.xml")
    file.save(xml_path)
    
    # Create task in progress tracker
    create_task(task_id)
    
    # Start processing in background thread
    thread = Thread(target=process_xml_background, args=(task_id, xml_path))
    thread.daemon = True
    thread.start()
    
    return jsonify({'task_id': task_id})

def process_xml_background(task_id, xml_path):
    try:
        # Parse XML
        parsed_data = parse_xml(Path(xml_path))
        
        # Load ISO controls
        csv_path = Path(CSV_FILE)
        iso_controls = load_iso_controls(csv_path)
        
        # Convert parsed data to list for compliance checking
        json_data = []
        for group_name, entries in parsed_data.items():
            json_data.extend(entries)
        
        # Run compliance check
        asyncio.run(run_compliance(iso_controls, json_data, task_id))
        
    except Exception as e:
        from tasks_progress import fail_task
        fail_task(task_id, str(e))
        print(f"Error processing task {task_id}: {e}")

@app.route('/api/task/<task_id>', methods=['GET'])
def get_task_status_route(task_id):
    task_status = get_task_status(task_id)
    
    if 'error' in task_status and task_status['error'] == 'Task not found':
        return jsonify({'error': 'Task not found'}), 404
    
    return jsonify(task_status)

@app.route('/api/results/<task_id>', methods=['GET'])
def get_results(task_id):
    task_status = get_task_status(task_id)
    
    if 'error' in task_status:
        return jsonify({'error': 'Task not found'}), 404
    
    if task_status.get('status') != 'completed':
        return jsonify({'error': 'Results not ready yet'}), 400
    
    return jsonify(task_status.get('result', {}))

if __name__ == '__main__':
    print("🔥 Compliance Checker Backend Started")
    print("📊 Ready to process XML files for ISO compliance")
    app.run(debug=True, port=5000, threaded=True)