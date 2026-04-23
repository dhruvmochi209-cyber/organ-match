import os
from werkzeug.utils import secure_filename
from flask import current_app
from utils.helpers import allowed_file

def upload_file(file, subfolder='reports'):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Create unique filename with timestamp
        import time
        unique_filename = f"{int(time.time())}_{filename}"
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
        os.makedirs(upload_path, exist_ok=True)
        full_path = os.path.join(upload_path, unique_filename)
        file.save(full_path)
        return os.path.join(subfolder, unique_filename).replace('\\', '/')
    return None
