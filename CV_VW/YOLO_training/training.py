import os
import shutil
from sklearn.model_selection import train_test_split

# -------------------------
# Paths
# -------------------------
images_root = r"D:\CV_VW\FULL_IMAGE_1000x750\OVERCAST"  # images folder (subfolders per date/camera)
labels_root = r"D:\CV_VW\YOLO_training\yolo_labels_from_csv"  # camera label txts
dataset_dir = r"D:\CV_VW\YOLO_training\yolo_dataset"

# YOLO dataset structure
images_train_dir = os.path.join(dataset_dir, "images", "train")
images_val_dir = os.path.join(dataset_dir, "images", "val")
labels_train_dir = os.path.join(dataset_dir, "labels", "train")
labels_val_dir = os.path.join(dataset_dir, "labels", "val")
os.makedirs(images_train_dir, exist_ok=True)
os.makedirs(images_val_dir, exist_ok=True)
os.makedirs(labels_train_dir, exist_ok=True)
os.makedirs(labels_val_dir, exist_ok=True)

# -------------------------
# Collect images per camera
# -------------------------
camera_images = {}  # key: camera txt label, value: list of images

for root, dirs, files in os.walk(images_root):
    for f in files:
        if f.lower().endswith((".jpg", ".png")):
            camera_name = os.path.basename(root)  # folder name, e.g., camera4
            label_file = os.path.join(labels_root, f"{camera_name}.txt")
            if os.path.exists(label_file):
                camera_images.setdefault(label_file, []).append(os.path.join(root, f))
            else:
                print(f"No label for camera image: {f} in {camera_name}")

# -------------------------
# Split images per camera into train/val
# -------------------------
for label_file, images in camera_images.items():
    train_imgs, val_imgs = train_test_split(images, test_size=0.2, random_state=42)

    # Copy train images and labels
    for img_path in train_imgs:
        shutil.copy(img_path, os.path.join(images_train_dir, os.path.basename(img_path)))
        shutil.copy(label_file, os.path.join(labels_train_dir, os.path.basename(img_path).replace(".jpg", ".txt").replace(".png", ".txt")))

    # Copy val images and labels
    for img_path in val_imgs:
        shutil.copy(img_path, os.path.join(images_val_dir, os.path.basename(img_path)))
        shutil.copy(label_file, os.path.join(labels_val_dir, os.path.basename(img_path).replace(".jpg", ".txt").replace(".png", ".txt")))

print("YOLO dataset with camera labels created successfully!")
