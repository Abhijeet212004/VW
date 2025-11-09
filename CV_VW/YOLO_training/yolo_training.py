import pandas as pd
import os
import cv2
from glob import glob

# Paths
images_root = r"D:\CV_VW\FULL_IMAGE_1000x750\OVERCAST"  # all camera folders inside
csv_root = r"D:\CV_VW\FULL_IMAGE_1000x750"  # CSVs like camera1.csv, camera2.csv
labels_root = r"D:\CV_VW\FULL_IMAGE_1000x750\yolo_labels"
os.makedirs(labels_root, exist_ok=True)

# Loop through all camera CSVs
csv_files = glob(os.path.join(csv_root, 'camera*.csv'))

for csv_file in csv_files:
    camera_name = os.path.splitext(os.path.basename(csv_file))[0]  # e.g., camera2
    df = pd.read_csv(csv_file)

    # Find images for this camera
    camera_images_path = os.path.join(images_root, '**', camera_name, '*.jpg')  # assuming folder contains camera name
    image_paths = glob(camera_images_path, recursive=True)
    
    for image_path in image_paths:
        image = cv2.imread(image_path)
        if image is None:
            print(f"Skipping {image_path}, cannot read image")
            continue
        
        height, width, _ = image.shape
        image_name = os.path.splitext(os.path.basename(image_path))[0]
        label_file = os.path.join(labels_root, f"{image_name}.txt")
        
        with open(label_file, "w") as f:
            for idx, row in df.iterrows():
                # YOLO format
                x_center = (row['X'] + row['W']/2) / width
                y_center = (row['Y'] + row['H']/2) / height
                w_norm = row['W'] / width
                h_norm = row['H'] / height
                class_id = 0  # single class 'slot'
                
                f.write(f"{class_id} {x_center:.6f} {y_center:.6f} {w_norm:.6f} {h_norm:.6f}\n")
        
        print(f"Created label for: {image_path}")

print("All camera labels generated successfully!")
