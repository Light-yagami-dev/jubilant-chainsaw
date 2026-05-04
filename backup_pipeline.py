import shutil
import os

def generate_workspace_archive(output_filename: str = "cortex_omni_backup") -> None:
    """
    Compresses the current working directory into a ZIP archive.
    Designed for automated state preservation prior to CI/CD deployments or destructive refactors.
    """
    execution_context = os.getcwd()
    print(f"[SYSTEM] Initializing archival sequence for: {execution_context}")
    
    try:
        # shutil.make_archive(base_name, format, root_dir)
        archive_path = shutil.make_archive(
            base_name=output_filename, 
            format="zip", 
            root_dir=execution_context
        )
        print(f"[SUCCESS] Workspace successfully archived: {archive_path}")
        
    except Exception as error_state:
        print(f"[CRITICAL FAILURE] Archival sequence aborted: {error_state}")

if __name__ == "__main__":
    generate_workspace_archive()