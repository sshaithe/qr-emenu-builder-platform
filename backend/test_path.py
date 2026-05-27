import os
upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
filename = 'qr_codes/qr_1_1.png'
safe = os.path.normpath(filename)
print(f"Input: {filename!r}")
print(f"normpath: {safe!r}")
print(f"startswith /: {safe.startswith('/')}")
print(f".. in safe: {'..' in safe}")
full_path = os.path.join(upload_folder, safe)
print(f"Full path: {full_path}")
print(f"File exists: {os.path.exists(full_path)}")
