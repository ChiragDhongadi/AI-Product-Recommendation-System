import os
import subprocess
import sys

def main():
    print("🚀 Bootstrapping Product Recommendation System...")
    
    # Check if npm is installed
    try:
        subprocess.run(["npm", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True, shell=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: Node.js and npm are required to run this project. Please install them and try again.", file=sys.stderr)
        sys.exit(1)

    # Install dependencies if node_modules does not exist
    if not os.path.exists("node_modules"):
        print("📦 node_modules not found. Installing Node.js dependencies...")
        try:
            subprocess.run(["npm", "install"], check=True, shell=True)
            print("✅ Dependencies installed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error installing dependencies: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print("✅ Node.js dependencies already installed.")

    # Start the development server
    print("⚡ Starting Vite React development server...")
    try:
        subprocess.run(["npm", "run", "dev"], check=True, shell=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting Vite development server: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
