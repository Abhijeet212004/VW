import os
import shutil
from glob import glob
import random

# Paths
images_root = r"D:\CV_VW\FULL_IMAGE_1000x750\OVERCAST"
labels_root = r"D:\CV_VW\FULL_IMAGE_1000x750\yolo_labels"  # folder containing .txt labels for each image
dataset_root = r"D:\CV_VW\FULL_IMAGE_1000x750\yolo_dataset"

# YOLO dataset structure
image_train_dir = os.path.join(dataset_root, 'images', 'train')
image_val_dir = os.path.join(dataset_root, 'images', 'val')
label_train_dir = os.path.join(dataset_root, 'labels', 'train')
label_val_dir = os.path.join(dataset_root, 'labels', 'val')

for folder in [image_train_dir, image_val_dir, label_train_dir, label_val_dir]:
    os.makedirs(folder, exist_ok=True)

# Collect all images recursively
all_images = glob(os.path.join(images_root, '**', '*.jpg'), recursive=True)
random.shuffle(all_images)

# Split train/val
split_ratio = 0.8
train_count = int(len(all_images) * split_ratio)

train_images = all_images[:train_count]
val_images = all_images[train_count:]

def copy_images_and_labels(image_list, image_dest, label_dest):
    for img_path in image_list:
        img_name = os.path.basename(img_path)
        name_no_ext = os.path.splitext(img_name)[0]
        
        # Copy image
        shutil.copy(img_path, os.path.join(image_dest, img_name))
        
        # Copy corresponding label
        label_file = os.path.join(labels_root, f"{name_no_ext}.txt")
        if os.path.exists(label_file):
            shutil.copy(label_file, os.path.join(label_dest, f"{name_no_ext}.txt"))
        else:
            print(f"Label not found for image: {img_path}")

# Copy train images and labels
copy_images_and_labels(train_images, image_train_dir, label_train_dir)

# Copy val images and labels
copy_images_and_labels(val_images, image_val_dir, label_val_dir)

print("YOLO dataset directory created successfully!")
print(f"Images train: {len(train_images)}, val: {len(val_images)}")
