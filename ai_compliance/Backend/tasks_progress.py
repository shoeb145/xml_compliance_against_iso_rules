# Global task progress tracker
tasks = {}

def create_task(task_id):
    """Initialize a new task"""
    tasks[task_id] = {
        'status': 'processing',
        'progress': 0,
        'current_rule': '',
        'message': 'Starting analysis...',
        'result': None,
        'error': None
    }

def update_task_progress(task_id, progress, current_rule="", message=""):
    """Update task progress without interrupting the main process"""
    if task_id in tasks:
        tasks[task_id]['progress'] = progress
        if current_rule:
            tasks[task_id]['current_rule'] = current_rule
        if message:
            tasks[task_id]['message'] = message

def finish_task(task_id, result):
    """Mark task as completed"""
    if task_id in tasks:
        tasks[task_id]['status'] = 'completed'
        tasks[task_id]['progress'] = 100
        tasks[task_id]['result'] = result
        tasks[task_id]['message'] = 'Analysis complete!'

def fail_task(task_id, error_message):
    """Mark task as failed"""
    if task_id in tasks:
        tasks[task_id]['status'] = 'error'
        tasks[task_id]['error'] = error_message
        tasks[task_id]['message'] = f'Error: {error_message}'

def get_task_status(task_id):
    """Get current task status"""
    return tasks.get(task_id, {'error': 'Task not found'})