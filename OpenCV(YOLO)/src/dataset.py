from torch.utils.data import Dataset
from PIL import Image
import os

class ParkingDataset(Dataset):
    def __init__(self, labels_file, root_dir, transform=None):
        with open(labels_file, "r") as f:
            self.image_labels = f.readlines()
        self.root_dir = root_dir
        self.transform = transform

    def __len__(self):
        return len(self.image_labels)

    def __getitem__(self, idx):
        img_name, label = self.image_labels[idx].strip().split()
        img_path = os.path.join(self.root_dir, img_name)
        image = Image.open(img_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        label = int(label)
        return image, label
