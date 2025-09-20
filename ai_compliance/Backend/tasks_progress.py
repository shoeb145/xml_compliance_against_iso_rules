import time

# Global task progress tracker with batched updates
tasks = {}
last_update_time = {}

def create_task(task_id):
    """Initialize a new task"""
    tasks[task_id] = {
        'status': 'processing',
        'progress': 0,
        'current_rule': '',
        'message': 'Starting analysis...',
        'result': None,
        'error': None,
        'last_updated': time.time()
    }
    last_update_time[task_id] = time.time()
    print(f"Created task {task_id}")

def update_task_progress(task_id, progress, current_rule="", message=""):
    """Update task progress with batching to reduce overhead"""
    if task_id not in tasks:
        return
        
    current_time = time.time()
    
    # Only update if significant change or enough time has passed
    if (abs(progress - tasks[task_id]['progress']) >= 5 or 
        current_time - last_update_time[task_id] >= 2 or 
        progress == 100):
        
        tasks[task_id]['progress'] = progress
        if current_rule:
            tasks[task_id]['current_rule'] = current_rule
        if message:
            tasks[task_id]['message'] = message
        tasks[task_id]['last_updated'] = current_time
        last_update_time[task_id] = current_time
        
        print(f"Task {task_id} progress: {progress}% - {message}")

def finish_task(task_id, result):
    """Mark task as completed"""
    if task_id in tasks:
        tasks[task_id]['status'] = 'completed'
        tasks[task_id]['progress'] = 100
        tasks[task_id]['result'] = result
        tasks[task_id]['message'] = 'Analysis complete!'
        tasks[task_id]['last_updated'] = time.time()
        print(f"Task {task_id} completed successfully")

def fail_task(task_id, error_message):
    """Mark task as failed"""
    if task_id in tasks:
        tasks[task_id]['status'] = 'error'
        tasks[task_id]['error'] = error_message
        tasks[task_id]['message'] = f'Error: {error_message}'
        tasks[task_id]['last_updated'] = time.time()
        print(f"Task {task_id} failed: {error_message}")

def get_task_status(task_id):
    """Get current task status"""
    if task_id not in tasks:
        return {'error': 'Task not found'}
    
    # Return a copy to avoid modification
    return {
        'status': tasks[task_id]['status'],
        'progress': tasks[task_id]['progress'],
        'current_rule': tasks[task_id]['current_rule'],
        'message': tasks[task_id]['message'],
        'error': tasks[task_id].get('error'),
        'result': tasks[task_id].get('result')
    }