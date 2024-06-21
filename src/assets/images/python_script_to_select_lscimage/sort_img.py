import os
import shutil
import re

def organize_images(directory):
    # Compile a regular expression pattern to match filenames starting with specific dates
    pattern = re.compile(r'^(20190101|20190102|20190103|20190104).*')

    # Iterate over all files in the directory
    for filename in os.listdir(directory):
        # Check if the filename matches the pattern
        if pattern.match(filename):
            # Extract the main directory name and the subdirectory name
            main_dir = filename[:6]  # '201901'
            sub_dir = filename[6:8]  # '01', '02', '03', '04'
            
            # Create the main directory if it doesn't exist
            main_dir_path = os.path.join(directory, main_dir)
            os.makedirs(main_dir_path, exist_ok=True)
            
            # Create the subdirectory if it doesn't exist
            sub_dir_path = os.path.join(main_dir_path, sub_dir)
            os.makedirs(sub_dir_path, exist_ok=True)
            
            # Construct the full file path
            source_path = os.path.join(directory, filename)
            destination_path = os.path.join(sub_dir_path, filename)
            
            try:
                # Move the file to the new location
                shutil.move(source_path, destination_path)
                print(f"Moved: {source_path} to {destination_path}")
            except Exception as e:
                print(f"Error moving {source_path} to {destination_path}: {e}")

# Replace 'your_directory_path' with the path to your directory containing the images
directory_path = '/home/pierre/Travail/Stage/PhotoCube-Client_2024/src/assets/images/lsc_thumbs512/thumbnails512/'
organize_images(directory_path)

