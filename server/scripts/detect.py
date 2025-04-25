#!/usr/bin/env python3
import argparse
import json
import os
import sys
import base64
from io import BytesIO
import cv2
import numpy as np

# Ensure ultralytics is installed
try:
    from ultralytics import YOLO
except ImportError:
    # Install if not available
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "ultralytics"])
    from ultralytics import YOLO

def parse_arguments():
    parser = argparse.ArgumentParser(description='Detect symbols in P&ID diagrams using YOLOv8')
    parser.add_argument('--image', type=str, required=True, help='Path to the input image')
    parser.add_argument('--output', type=str, required=True, help='Path for the output image')
    parser.add_argument('--conf', type=float, default=0.5, help='Confidence threshold')
    parser.add_argument('--iou', type=float, default=0.45, help='IoU threshold')
    return parser.parse_args()

def encode_image_to_base64(image_path):
    """Encode an image file to base64 string"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def encode_cv2_image_to_base64(img):
    """Encode a cv2 image to base64 string"""
    _, buffer = cv2.imencode('.jpg', img)
    return base64.b64encode(buffer).decode('utf-8')

def detect_symbols(image_path, output_path, conf_threshold, iou_threshold):
    """Detect symbols in a P&ID diagram using YOLOv8"""
    # Load model - use a pre-trained YOLOv8 model
    # In a real implementation, this would be your fine-tuned model for P&ID symbols
    model = YOLO('yolov8n.pt')  # Use default model for demonstration
    
    # Load the image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")
    
    # Make a copy for drawing results later
    original_image = image.copy()
    
    # Run prediction with the model
    results = model(image, conf=conf_threshold, iou=iou_threshold, agnostic=True)
    
    # Process results
    detections = []
    result = results[0]  # Get first result (only one image processed)
    
    # Draw bounding boxes and labels on the image
    for box in result.boxes:
        # Get box coordinates
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        x, y, w, h = int(x1), int(y1), int(x2 - x1), int(y2 - y1)
        
        # Get class and confidence
        cls_id = int(box.cls[0].item())
        confidence = float(box.conf[0].item())
        cls_name = result.names[cls_id]
        
        # Draw rectangle and label
        color = (0, 255, 0)  # Green color
        cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
        
        # Add label with class name and confidence
        label = f"{cls_name} {confidence:.2f}"
        cv2.putText(image, label, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # Add detection to results
        detections.append({
            "class": cls_name,
            "confidence": confidence,
            "bbox": {"x": x, "y": y, "width": w, "height": h}
        })
    
    # Save the annotated image
    cv2.imwrite(output_path, image)
    
    # Prepare the result object
    result_object = {
        "original_image": encode_cv2_image_to_base64(original_image),
        "processed_image": encode_cv2_image_to_base64(image),
        "detections": detections
    }
    
    return result_object

def main():
    args = parse_arguments()
    
    try:
        # Perform detection
        result = detect_symbols(
            args.image, 
            args.output, 
            args.conf, 
            args.iou
        )
        
        # Output JSON result to stdout for the Node.js process to capture
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
