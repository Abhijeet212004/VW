from src.train import train_model
from src.evalute import evaluate_model
from src.predict import predict_image
from src.visualize import visualize_prediction

if __name__ == "__main__":
    # Step 1: Train the model
    train_model()

    # Step 2: Evaluate the trained model
    evaluate_model("outputs/checkpoints/epoch_5.pth")

    # Step 3: Predict a single image
    # D:\CV_VW\CNR_EXT\PATCHES\OVERCAST\2015-11-16\camera6\O_2015-11-16_07.17_C06_201.jpg
    predict_image(r"D:\CV_VW\FULL_IMAGE_1000x750\OVERCAST\2015-11-16\camera1\2015-11-16_0710.jpg")

    # Step 4: Visualize prediction
    visualize_prediction(r"D:\CV_VW\FULL_IMAGE_1000x750\OVERCAST\2015-11-16\camera1\2015-11-16_0710.jpg")
