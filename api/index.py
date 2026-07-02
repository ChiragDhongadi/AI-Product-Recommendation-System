import sys
import os

# Add the backend directory to system path to ensure relative imports resolve
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, backend_path)

from main import app
