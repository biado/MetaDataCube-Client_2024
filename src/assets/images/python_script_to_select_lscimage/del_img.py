import os
import re

def delete_non_matching_images(directory):
    # Compile a regular expression pattern to match filenames starting with '2019'
    pattern = re.compile(r'^(20190101|20190102|20190103|20190104).*')

    # Iterate over all files in the directory
    for filename in os.listdir(directory):
        # Check if the filename matches the pattern
        if not pattern.match(filename):
            # Construct the full file path
            file_path = os.path.join(directory, filename)
            try:
                # Remove the file
                os.remove(file_path)
                print(f"Deleted: {file_path}")
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")

# Replace 'your_directory_path' with the path to your directory containing the images
directory_path = '/home/pierre/Travail/Stage/PhotoCube-Client_2024/src/assets/images/lsc_thumbs512/thumbnails512/'
delete_non_matching_images(directory_path)

