from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
import json
from pathlib import Path
from xml_parser import parse_xml_from_string
from iso_loader import load_iso_controls
from compliance import run_compliance
from tasks_progress import create_task, update_task_progress, finish_task, fail_task, get_task_status
from threading import Thread
import asyncio
import time

app = Flask(__name__, static_folder="client/dist", static_url_path="/")

CORS(app)

# Configuration
CSV_FILE = 'iso_controls.csv'

# In-memory task storage (using tasks_progress module)
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
    
    try:
        # Read file content directly to memory (no disk I/O)
        xml_content = file.read().decode('utf-8')
        
        # Create task in progress tracker
        create_task(task_id)
        
        # Start processing in background thread
        thread = Thread(target=run_async_compliance, args=(task_id, xml_content))
        thread.daemon = True
        thread.start()
        
        return jsonify({'task_id': task_id})
        
    except Exception as e:
        return jsonify({'error': f'Failed to read file: {str(e)}'}), 500

def run_async_compliance(task_id, xml_content):
    """Run the async compliance check in a separate thread"""
    try:
        # Create a new event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Run the async function
        result = loop.run_until_complete(process_xml_background(task_id, xml_content))
        return result
    except Exception as e:
        print(f"Error in run_async_compliance: {e}")
        fail_task(task_id, str(e))
    finally:
        loop.close()

async def process_xml_background(task_id, xml_content):
    try:
        print(f"Starting processing for task {task_id}")
        
        # Update status
        update_task_progress(task_id, 10, 'Parsing XML configuration')
        
        # Parse XML directly from string (no file I/O)
        parsed_data = parse_xml_from_string(xml_content)
        total_entries = sum(len(v) for v in parsed_data.values())
        print(f"Parsed XML with {total_entries} entries across {len(parsed_data)} groups")
        
        # Update status
        update_task_progress(task_id, 30, 'Loading ISO controls')
        
        # Load ISO controls
        csv_path = Path(CSV_FILE)
        iso_controls = load_iso_controls(csv_path)
        print(f"Loaded {len(iso_controls)} ISO controls")
        
        # Convert parsed data to list for compliance checking
        json_data = []
        for group_name, entries in parsed_data.items():
            json_data.extend(entries)
        
        # Update status
        update_task_progress(task_id, 50, 'Running compliance checks with AI')
        print(f"Starting compliance analysis with {len(json_data)} configuration items")
        
        # Run compliance check (async version)
        result = await run_compliance(iso_controls, json_data, task_id)
        
        # Update task with result (no file I/O)
        finish_task(task_id, result)
        print(f"Completed processing for task {task_id}")
        
        return result
        
    except Exception as e:
        print(f"Error in process_xml_background: {e}")
        fail_task(task_id, str(e))

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


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path.startswith("api/"):
        # let API routes handle themselves
        return jsonify({'error': 'Not found'}), 404
    full_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


if __name__ == '__main__':
    print("🔥 Optimized Async Compliance Checker Backend Started")
    print("📊 Ready to process XML files for ISO compliance")
    app.run(debug=True, port=5000, threaded=True)