import os
import cv2

# Paths
dataset_root = r"D:\CV_VW\YOLO_training\yolo_dataset"
labels_root = os.path.join(dataset_root, "labels")  # current labels in pixel units

# Process both train and val
for split in ['train', 'val']:
    images_dir = os.path.join(dataset_root, "images", split)
    labels_dir = os.path.join(labels_root, split)
    
    for img_file in os.listdir(images_dir):
        if not img_file.endswith(".jpg"):
            continue
        
        img_path = os.path.join(images_dir, img_file)
        image = cv2.imread(img_path)
        if image is None:
            print(f"Skipping {img_path}, cannot read image")
            continue
        
        height, width, _ = image.shape
        label_file = os.path.join(labels_dir, img_file.replace(".jpg", ".txt"))
        
        if not os.path.exists(label_file):
            print(f"Label missing for {img_file}")
            continue
        
        # Read old labels
        new_lines = []
        with open(label_file, "r") as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) != 5:
                    continue  # skip invalid lines
                class_id, x, y, w, h = parts
                x = float(x)
                y = float(y)
                w = float(w)
                h = float(h)
                
                # Normalize
                x_norm = x / width
                y_norm = y / height
                w_norm = w / width
                h_norm = h / height
                
                new_lines.append(f"{class_id} {x_norm:.6f} {y_norm:.6f} {w_norm:.6f} {h_norm:.6f}")
        
        # Overwrite file with normalized labels
        with open(label_file, "w") as f:
            f.write("\n".join(new_lines))
        
        print(f"Normalized labels for: {img_file}")

print("All labels normalized to YOLO format!")
