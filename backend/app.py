"""
Flask Backend for PDO Data Transposition
This will handle Excel processing, column detection, API calls, and output generation.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json as json_lib
from pathlib import Path
from dotenv import load_dotenv
import sys
import importlib.util
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow React frontend to make requests

# Add Logics folder to Python path
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
logics_dir = project_root / 'Logics'
sys.path.insert(0, str(logics_dir))

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Backend is running"})

@app.route('/api/update-user-info', methods=['POST'])
def update_user_info():
    """Update userInfo.json file"""
    try:
        data = request.json
        if not data or 'email' not in data:
            return jsonify({"error": "Invalid data. 'email' field required"}), 400
        
        # Get the path to userInfo.json relative to backend
        # Assuming the file is in src/data/userInfo.json
        backend_dir = Path(__file__).parent
        project_root = backend_dir.parent
        user_info_path = project_root / 'src' / 'data' / 'userInfo.json'
        
        # Ensure we have both email and role
        user_info = {
            "email": data.get('email', ''),
            "role": data.get('role', '')
        }
        
        # Write updated userInfo
        with open(user_info_path, 'w') as f:
            json_lib.dump(user_info, f, indent=2)
            f.write('\n')
        
        return jsonify({"status": "success", "message": "User info updated successfully", "data": user_info})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/check-user-connection', methods=['POST'])
def check_user_connection():
    """Check if user credentials can connect to Snowflake"""
    try:
        data = request.json
        if not data or 'user_email' not in data or 'role' not in data:
            return jsonify({"error": "Invalid data. 'user_email' and 'role' fields required"}), 400
        
        user_email = data['user_email']
        role = data['role']
        force_refresh = data.get('force_refresh', False)
        timestamp = data.get('timestamp', None)
        
        # Import and run usercheck module
        try:
            usercheck_path = logics_dir / 'usercheck.py'
            if not usercheck_path.exists():
                return jsonify({"error": f"usercheck.py not found at {usercheck_path}"}), 500
            
            spec = importlib.util.spec_from_file_location("usercheck", usercheck_path)
            usercheck = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(usercheck)
            # Pass force_refresh flag to force fresh authentication
            result = usercheck.check_user_connection(user_email, role, force_refresh=force_refresh)
            
            return jsonify(result)
        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Failed to check user connection: {str(e)}",
                "error": str(e)
            }), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/get-practice-info', methods=['POST'])
def get_practice_info():
    """Get practice information from API for manual Practice IDs"""
    try:
        data = request.get_json()
        manual_practice_ids = data.get('manualPracticeIds', '')
        
        if not manual_practice_ids or not manual_practice_ids.strip():
            return jsonify({
                'success': False,
                'error': 'No Practice IDs provided'
            }), 400
        
        # Import Practice_name module
        practice_name_path = logics_dir / 'Practice_name.py'
        if not practice_name_path.exists():
            return jsonify({"error": f"Practice_name.py not found at {practice_name_path}"}), 500
        
        spec = importlib.util.spec_from_file_location("Practice_name", practice_name_path)
        practice_name = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(practice_name)
        
        # Get practice display info
        result = practice_name.get_practice_display_info(manual_practice_ids=manual_practice_ids)
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Failed to get practice info: {str(e)}"
        }), 500

@app.route('/api/check-vpn-connection', methods=['POST'])
def check_vpn_connection():
    """Check VPN connection by testing Practice ID extraction"""
    try:
        data = request.json
        if not data or 'practice_id' not in data:
            return jsonify({"error": "Invalid data. 'practice_id' field required"}), 400
        
        practice_id = str(data['practice_id'])
        
        # Import and use fetch_practice_locations module to test connection
        try:
            fetch_practice_locations_path = logics_dir / 'fetch_practice_locations.py'
            if not fetch_practice_locations_path.exists():
                return jsonify({"error": f"fetch_practice_locations.py not found at {fetch_practice_locations_path}"}), 500
            
            spec = importlib.util.spec_from_file_location("fetch_practice_locations", fetch_practice_locations_path)
            fetch_practice_locations = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(fetch_practice_locations)
            
            # Try to convert the practice ID to cloud ID
            cloud_id_map = fetch_practice_locations.convert_to_cloud_ids([practice_id])
            
            if cloud_id_map and practice_id in cloud_id_map:
                # Successfully converted, now try to fetch location details
                cloud_id = cloud_id_map[practice_id]
                locations = fetch_practice_locations.fetch_location_details(cloud_id)
                
                if locations:
                    return jsonify({
                        "success": True,
                        "message": f"Successfully extracted data for Practice ID {practice_id}",
                        "practice_id": practice_id,
                        "cloud_id": cloud_id,
                        "locations_count": len(locations)
                    })
                else:
                    return jsonify({
                        "success": False,
                        "message": f"Practice ID {practice_id} converted but no location data found",
                        "practice_id": practice_id
                    })
            else:
                return jsonify({
                    "success": False,
                    "message": f"Failed to convert Practice ID {practice_id} to cloud ID",
                    "practice_id": practice_id
                })
        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Failed to check VPN connection: {str(e)}",
                "error": str(e)
            }), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/convert', methods=['POST'])
def convert_mappings():
    """Convert mappings to Excel file and save uploaded file"""
    try:
        # Check if file is uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get mappings from form data
        mappings_json = request.form.get('mappings')
        if not mappings_json:
            return jsonify({"error": "Invalid data. 'mappings' field required"}), 400
        
        try:
            mappings = json_lib.loads(mappings_json)
        except json_lib.JSONDecodeError:
            return jsonify({"error": "Invalid JSON in mappings field"}), 400
        
        if not isinstance(mappings, list) or len(mappings) == 0:
            return jsonify({"error": "Mappings must be a non-empty array"}), 400
        
        # Ensure Excel Files directory exists
        backend_dir = Path(__file__).parent
        excel_files_dir = backend_dir / 'Excel Files'
        excel_files_dir.mkdir(parents=True, exist_ok=True)
        
        # Save uploaded file as Input.xlsx (always overwrite if exists)
        uploaded_file_path = excel_files_dir / 'Input.xlsx'
        
        # Remove existing file if it exists (to replace it)
        if uploaded_file_path.exists():
            os.remove(str(uploaded_file_path))
        
        file.save(str(uploaded_file_path))
        
        # Import the mappings_raw module
        try:
            # Use importlib to load the module from Logics folder
            mappings_raw_path = logics_dir / 'mappings_raw.py'
            if not mappings_raw_path.exists():
                return jsonify({"error": f"mappings_raw.py not found at {mappings_raw_path}"}), 500
            
            spec = importlib.util.spec_from_file_location("mappings_raw", mappings_raw_path)
            mappings_raw = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mappings_raw)
            create_mappings_excel = mappings_raw.create_mappings_excel
        except Exception as e:
            return jsonify({"error": f"Failed to import mappings_raw: {str(e)}"}), 500
        
        # Create Excel file for mappings
        try:
            mappings_path = create_mappings_excel(mappings)
        except Exception as e:
            return jsonify({"error": f"Failed to create Excel file: {str(e)}"}), 500
        
        # Import and run create_mapped module to create _Mapped.xlsx
        try:
            create_mapped_path = logics_dir / 'create_mapped.py'
            if not create_mapped_path.exists():
                return jsonify({"error": f"create_mapped.py not found at {create_mapped_path}"}), 500
            
            spec = importlib.util.spec_from_file_location("create_mapped", create_mapped_path)
            create_mapped = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(create_mapped)
            mapped_path = create_mapped.create_mapped_excel()
        except Exception as e:
            return jsonify({"error": f"Failed to create _Mapped.xlsx: {str(e)}"}), 500
        
        # Get manual Practice IDs if provided
        manual_practice_ids = request.form.get('manualPracticeIds', '').strip()
        
        # Import and run create_locations_input module to create Locations_input.xlsx
        locations_input_path = None
        try:
            create_locations_input_path = logics_dir / 'create_locations_input.py'
            if not create_locations_input_path.exists():
                return jsonify({"error": f"create_locations_input.py not found at {create_locations_input_path}"}), 500
            
            spec = importlib.util.spec_from_file_location("create_locations_input", create_locations_input_path)
            create_locations_input = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(create_locations_input)
            locations_input_path = create_locations_input.create_locations_input_excel(manual_practice_ids=manual_practice_ids)
        except Exception as e:
            return jsonify({"error": f"Failed to create Locations_input.xlsx: {str(e)}"}), 500
        
        # Import and run NPIsnowflake module to create NPI-Extracts.xlsx
        npi_extracts_path = None
        npi_extraction_info = None
        try:
            # Read userInfo.json to get email and role for Snowflake connection
            user_info_path = project_root / 'src' / 'data' / 'userInfo.json'
            if not user_info_path.exists():
                return jsonify({"error": "userInfo.json not found. Please configure email and role."}), 500
            
            with open(user_info_path, 'r') as f:
                user_info = json_lib.load(f)
            
            user_email = user_info.get('email')
            user_role = user_info.get('role')
            
            if not user_email or not user_role:
                return jsonify({"error": "Email and role must be configured in userInfo.json"}), 500
            
            npi_snowflake_path = logics_dir / 'NPIsnowflake.py'
            if not npi_snowflake_path.exists():
                return jsonify({"error": f"NPIsnowflake.py not found at {npi_snowflake_path}"}), 500
            
            spec = importlib.util.spec_from_file_location("NPIsnowflake", npi_snowflake_path)
            npi_snowflake = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(npi_snowflake)
            result = npi_snowflake.create_npi_extracts(user_email, user_role)
            
            # Handle both old return format (string) and new format (tuple)
            if isinstance(result, tuple):
                npi_extracts_path, npi_extraction_info = result
                # Check if NPI extraction was skipped (None path means skipped)
                if npi_extracts_path is None:
                    print("NPI-Extracts.xlsx creation was skipped (NPI column not found or empty).")
            else:
                npi_extracts_path = result
                npi_extraction_info = None
        except Exception as e:
            # Only return error if it's not a skip case
            error_msg = str(e)
            if "NPI Number column not found" in error_msg or "No valid NPI numbers found" in error_msg:
                print(f"NPI-Extracts.xlsx creation skipped: {error_msg}")
            else:
                return jsonify({"error": f"Failed to create NPI-Extracts.xlsx: {str(e)}"}), 500
        
        response_data = {
            "status": "success",
            "message": "Files created successfully",
            "mappings_path": mappings_path,
            "input_file_path": str(uploaded_file_path),
            "mapped_path": mapped_path,
            "locations_input_path": locations_input_path,
            "npi_extracts_path": npi_extracts_path
        }
        
        if npi_extraction_info:
            response_data["npi_extraction_info"] = npi_extraction_info
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/pack', methods=['POST'])
def pack_data():
    """Execute main.py to pack data into Template copy.xlsx and rename it"""
    try:
        # Get file name from request
        data = request.get_json() if request.is_json else {}
        file_name = data.get('file_name', 'Template copy').strip()
        
        # Sanitize file name (remove invalid characters)
        import re
        file_name = re.sub(r'[<>:"/\\|?*]', '', file_name)
        if not file_name:
            file_name = 'Template copy'
        
        # Import and run main.py from Transposition Logics folder
        transposition_logics_dir = project_root / 'Transposition Logics'
        main_py_path = transposition_logics_dir / 'main.py'
        
        if not main_py_path.exists():
            return jsonify({"error": f"main.py not found at {main_py_path}"}), 500
        
        # Add Transposition Logics directory to path for imports
        sys.path.insert(0, str(transposition_logics_dir))
        
        # Import and execute main.py
        spec = importlib.util.spec_from_file_location("main", main_py_path)
        main_module = importlib.util.module_from_spec(spec)
        
        # Capture stdout to get print statements
        import io
        import contextlib
        
        output_buffer = io.StringIO()
        with contextlib.redirect_stdout(output_buffer):
            spec.loader.exec_module(main_module)
        
        output = output_buffer.getvalue()
        
        # Get the template file path
        excel_files_dir = backend_dir / 'Excel Files'
        template_path = excel_files_dir / 'Template copy.xlsx'
        
        if not template_path.exists():
            return jsonify({"error": "Template copy.xlsx was not created"}), 500
        
        # Rename the file if a different name was provided
        final_template_path = template_path
        if file_name != 'Template copy':
            final_template_path = excel_files_dir / f'{file_name}.xlsx'
            # If file with same name exists, add a number suffix
            counter = 1
            while final_template_path.exists():
                final_template_path = excel_files_dir / f'{file_name} ({counter}).xlsx'
                counter += 1
            template_path.rename(final_template_path)
        
        return jsonify({
            "status": "success",
            "message": "Data packing completed successfully",
            "template_path": str(final_template_path),
            "file_name": final_template_path.stem,
            "output": output
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to pack data: {str(e)}"}), 500

@app.route('/api/open-file-explorer', methods=['POST'])
def open_file_explorer():
    """Open file explorer to the location of the created template file"""
    try:
        data = request.get_json() if request.is_json else {}
        file_path = data.get('file_path', '')
        
        if not file_path:
            return jsonify({"error": "File path is required"}), 400
        
        import platform
        import subprocess
        
        file_path_obj = Path(file_path)
        
        # Check if file exists
        if not file_path_obj.exists():
            return jsonify({"error": "File does not exist"}), 404
        
        # Get the directory containing the file
        file_dir = file_path_obj.parent
        
        # Open file explorer based on OS
        if platform.system() == 'Windows':
            # Windows: use explorer.exe
            subprocess.Popen(f'explorer /select,"{file_path_obj}"')
        elif platform.system() == 'Darwin':  # macOS
            # macOS: use open command
            subprocess.Popen(['open', '-R', str(file_path_obj)])
        else:  # Linux
            # Linux: use xdg-open or nautilus
            try:
                subprocess.Popen(['xdg-open', str(file_dir)])
            except:
                subprocess.Popen(['nautilus', str(file_dir)])
        
        return jsonify({
            "status": "success",
            "message": "File explorer opened successfully",
            "file_path": str(file_path)
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to open file explorer: {str(e)}"}), 500

@app.route('/api/check-file-exists', methods=['POST'])
def check_file_exists():
    """Check if a file exists at the given path"""
    try:
        data = request.get_json() if request.is_json else {}
        file_path = data.get('file_path', '')
        
        if not file_path:
            return jsonify({"error": "File path is required"}), 400
        
        file_path_obj = Path(file_path)
        exists = file_path_obj.exists()
        
        return jsonify({
            "status": "success",
            "exists": exists,
            "file_path": str(file_path)
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to check file existence: {str(e)}"}), 500

@app.route('/api/delete-excel-files', methods=['POST'])
def delete_excel_files():
    """Delete all Excel files in the backend/Excel Files directory"""
    try:
        backend_dir = Path(__file__).parent
        excel_files_dir = backend_dir / 'Excel Files'
        
        if not excel_files_dir.exists():
            return jsonify({
                "status": "success",
                "message": "Excel Files directory does not exist",
                "deleted_count": 0
            })
        
        # Find all Excel files (.xlsx, .xls)
        excel_extensions = ['.xlsx', '.xls']
        deleted_files = []
        deleted_count = 0
        
        for file_path in excel_files_dir.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in excel_extensions:
                try:
                    file_path.unlink()
                    deleted_files.append(file_path.name)
                    deleted_count += 1
                except Exception as e:
                    return jsonify({
                        "error": f"Failed to delete {file_path.name}: {str(e)}"
                    }), 500
        
        return jsonify({
            "status": "success",
            "message": f"Successfully deleted {deleted_count} Excel file(s)",
            "deleted_count": deleted_count,
            "deleted_files": deleted_files
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to delete Excel files: {str(e)}"}), 500

# TODO: Add your endpoints here
# - POST /api/upload (upload Excel file)
# - POST /api/detect-columns (detect column types)
# - POST /api/process (process data with APIs)
# - POST /api/generate-output (generate output Excel)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

