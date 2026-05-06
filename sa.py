import os
import zipfile
import logging
from pathlib import Path

# Initialize structural logging for architectural oversight
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ArchiveArchitect")

def validate_reproducibility(source_path: Path) -> bool:
    """
    Enforces the presence of a dependency manifest. 
    A repository without dependencies declared is structurally invalid.
    """
    manifest_path = source_path / "requirements.txt"
    if not manifest_path.exists():
        logger.critical("Dependency manifest (requirements.txt) is missing. Deployment aborted.")
        return False
    return True

def execute_compression_pipeline(source_directory: Path, output_filename: str):
    """
    Executes a memory-efficient, streaming compression pipeline optimized for constrained 
    mobile environments. Integrates an exclusion matrix to reject bloatware.
    """
    if not validate_reproducibility(source_directory):
        raise SystemExit("Fatal Architecture Error: Non-reproducible state.")

    output_path = source_directory / output_filename
    
    # The Exclusion Matrix: Define directories and extensions that bloat the payload
    EXCLUDED_DIRS = {'.git', '__pycache__', 'venv', 'env', 'node_modules', '.idea', '.mypy_cache'}
    EXCLUDED_EXTENSIONS = {'.pyc', '.pyo', '.pyd', '.log', '.zip', '.sqlite3'}

    logger.info(f"Initializing streaming compression targeting: {output_filename}")
    
    # ZIP_DEFLATED utilizes standard LZ77 algorithm. Compresslevel 9 forces maximum reduction.
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for root, dirs, files in os.walk(source_directory):
            
            # Prune excluded directories in-place to prevent deep traversal of dead zones
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            
            for file in files:
                file_path = Path(root) / file
                
                # Exclude runtime artifacts and prevent recursive zipping of the output file
                if file_path.suffix in EXCLUDED_EXTENSIONS or file_path.name == output_filename:
                    continue
                    
                # Calculate relative path to maintain internal directory structure
                archive_name = file_path.relative_to(source_directory)
                
                logger.debug(f"Injecting node into payload: {archive_name}")
                archive.write(file_path, arcname=archive_name)
                
    logger.info(f"Compression pipeline terminated successfully. Optimized payload secured at {output_path.absolute()}")

if __name__ == "__main__":
    # Execute within the current working directory
    CURRENT_DIRECTORY = Path(".")
    TARGET_PAYLOAD_NAME = "reproducible_build_v1.zip"
    
    execute_compression_pipeline(CURRENT_DIRECTORY, TARGET_PAYLOAD_NAME)
    