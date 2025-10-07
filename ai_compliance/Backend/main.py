from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from pathlib import Path
from xml_parser import parse_xml_from_string
from iso_loader import load_iso_controls
from compliance import run_compliance
from tasks_progress import create_task, update_task_progress, finish_task, fail_task, get_task_status
from threading import Thread
import asyncio
import base64
from io import BytesIO
from PIL import Image
from compliance import recheck_rule_with_evidence
from s3_service import s3_service
from textract_service import textract_service

# Get the directory where main.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_FOLDER = os.path.join(BASE_DIR, 'client', 'dist')

# Check if static folder exists
if os.path.exists(STATIC_FOLDER):
    print(f"✓ Found static folder at: {STATIC_FOLDER}")
    app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path="/frontend")
else:
    print(f"⚠ Static folder not found at: {STATIC_FOLDER}")
    print("  Running in API-only mode")
    app = Flask(__name__)

CORS(app)

# Configuration
CSV_FILE = 'iso_controls.csv'

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

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'xml-compliance-checker'})

# Serve React frontend - only if static folder exists
if os.path.exists(STATIC_FOLDER):
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        # API routes should not be caught here
        if path.startswith("api/"):
            return jsonify({'error': 'Not found'}), 404
        
        # Check if file exists
        full_path = os.path.join(STATIC_FOLDER, path)
        if path != "" and os.path.exists(full_path) and os.path.isfile(full_path):
            return send_from_directory(STATIC_FOLDER, path)
        
        # Fallback to index.html for SPA routing
        index_path = os.path.join(STATIC_FOLDER, "index.html")
        if os.path.exists(index_path):
            return send_from_directory(STATIC_FOLDER, "index.html")
        else:
            return jsonify({
                'error': 'Frontend not found',
                'message': 'index.html is missing from client/dist'
            }), 404
else:
    # API-only mode fallback
    @app.route("/")
    def api_info():
        return jsonify({
            'service': 'XML Compliance Checker API',
            'status': 'running',
            'mode': 'API only (frontend not deployed)',
            'version': '1.0',
            'endpoints': {
                'health': '/api/health',
                'upload': '/api/upload (POST)',
                'task_status': '/api/task/<task_id> (GET)',
                'results': '/api/results/<task_id> (GET)'
            }
        })
    
@app.route('/api/recheck-rule', methods=['POST'])
def recheck_rule():
    """
    Re-evaluate a specific rule with screenshot evidence
    """
    try:
        # Check if image file is provided
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        
        # Get form data
        task_id = request.form.get('task_id')
        control_id = request.form.get('control_id')
        control_name = request.form.get('control_name')
        control_description = request.form.get('control_description')
        current_status = request.form.get('current_status')
        current_reasoning = request.form.get('current_reasoning')
        
        # Validate required fields
        required_fields = [task_id, control_id, control_name, control_description]
        if not all(required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        print(f"🔄 Rechecking rule {control_id} for task {task_id}")
        
        # 1. Upload to S3 and extract text
        image_data = image_file.read()
        file_extension = image_file.filename.split('.')[-1] if '.' in image_file.filename else 'jpg'
        
        # Upload to S3
        s3_url = s3_service.upload_file(image_data, file_extension)
        print(f"📁 Image uploaded to S3: {s3_url}")
        
        # Extract text from S3 using Textract
        extracted_text = textract_service.extract_text_from_s3(s3_url)
        print(f"📄 Extracted {len(extracted_text)} characters")
        
        # Prepare rule data for AI analysis
        rule_data = {
            'control_id': control_id,
            'control_name': control_name,
            'control_description': control_description,
            'current_status': current_status,
            'current_reasoning': current_reasoning
        }
        
        # Run AI recheck (async)
        async def run_recheck():
            return await recheck_rule_with_evidence(rule_data, extracted_text)
        
        # Execute async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        recheck_result = loop.run_until_complete(run_recheck())
        loop.close()
        
        # Prepare response
        response = {
            "success": True,
            "updated_rule": {
                "control_id": control_id,
                "control_name": control_name,
                "status": recheck_result["status"].capitalize(),
                "reasoning": recheck_result["reasoning"],
                "confidence": recheck_result["confidence"],
                "key_findings": recheck_result["key_findings"],
                "extracted_text": extracted_text,
                "s3_url": s3_url,  # Include S3 URL in response
                "previous_status": current_status
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Recheck endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": f"Recheck failed: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("🔥 Optimized Async Compliance Checker Backend Started")
    print("📊 Ready to process XML files for ISO compliance")
    
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    app.run(host='0.0.0.0', port=port, debug=debug, threaded=True)
