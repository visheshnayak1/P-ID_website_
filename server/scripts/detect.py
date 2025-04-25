import os
import argparse
import base64
import json
import cv2
import numpy as np
import uuid
from PIL import Image
import io

# Class names for P&ID symbols
PID_CLASSES = {
    0: 'pipe_coupling',
    1: 'check_valve',
    2: 'gate_valve_vertical',
    3: 'gate_valve_horizontal',
    4: 'globe_valve',
    5: 'three_way_valve',
    6: 'needle_valve',
    7: 'control_valve',
    8: 'ball_valve',
    9: 'butterfly_valve',
    10: 'plug_valve',
    11: 'quick_connect_coupling',
    12: 'relief_valve',
    13: 'pressure_reducing_valve',
    14: 'rupture_disk',
    15: 'float_trap',
    16: 'line_size_marker',
    17: 'line_specification_break',
    18: 'temperature_indicator',
    19: 'flow_indicator',
    20: 'point_indicator',
    21: 'equipment_tag_rectangular',
    22: 'equipment_tag_circular',
    23: 'equipment_tag_octagonal',
    24: 'equipment_tag_hexagonal',
    25: 'instrument_bubble_circular',
    26: 'instrument_bubble_square',
    27: 'junction_box',
    28: 'heat_exchanger',
    29: 'station_panel',
    30: 'tank',
    31: 'filter',
}

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Detect P&ID symbols in an image')
    parser.add_argument('--image', type=str, required=True, help='Path to input image')
    parser.add_argument('--output', type=str, required=True, help='Path to output image')
    parser.add_argument('--conf-thres', type=float, default=0.25, help='Confidence threshold')
    parser.add_argument('--iou-thres', type=float, default=0.45, help='NMS IoU threshold')
    
    return parser.parse_args()

def encode_image_to_base64(image_path):
    """Encode an image file to base64 string"""
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded_string

def encode_cv2_image_to_base64(img):
    """Encode a cv2 image to base64 string"""
    _, buffer = cv2.imencode('.jpg', img)
    encoded_string = base64.b64encode(buffer).decode('utf-8')
    return encoded_string

def detect_symbols(image_path, output_path, conf_threshold=0.25, iou_threshold=0.45):
    """
    Simplified detection for P&ID symbols using OpenCV
    
    Args:
        image_path: Path to the input image
        output_path: Path to save the processed image
        conf_threshold: Confidence threshold for detections
        iou_threshold: IoU threshold for NMS
        
    Returns:
        Dictionary with detection results
    """
    # For demonstration, we'll use basic image processing to identify potential symbols
    # In a real implementation, this would use an actual trained model
    
    # Generate a unique ID for this detection
    detection_id = str(uuid.uuid4())
    
    # Read the image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at {image_path}")
    
    # Get original image dimensions
    height, width = img.shape[:2]
    
    # Create a copy of the image for drawing
    result_img = img.copy()
    
    # Convert to grayscale for processing
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply threshold to create binary image
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter contours based on area
    min_area = 100  # Minimum area to consider
    valid_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]
    
    # Prepare list for detections
    detections = []
    
    # Process each contour as a potential symbol
    for i, cnt in enumerate(valid_contours):
        # Get bounding box
        x, y, w, h = cv2.boundingRect(cnt)
        
        # Generate a random confidence score (in a real model this would be the actual confidence)
        confidence = np.random.uniform(conf_threshold, 1.0)
        
        # Skip if confidence is below threshold
        if confidence < conf_threshold:
            continue
        
        # Generate a random class ID (in a real model this would be the predicted class)
        class_id = np.random.randint(0, len(PID_CLASSES))
        class_name = PID_CLASSES[class_id]
        
        # Create a detection result
        detection = {
            "id": f"{detection_id}_{i}",
            "class": class_name,
            "confidence": float(confidence),
            "bbox": {
                "x": x / width,  # Normalize coordinates
                "y": y / height,
                "width": w / width,
                "height": h / height
            }
        }
        
        detections.append(detection)
        
        # Draw bounding box and label on the image
        color = (0, 255, 0)  # Green
        cv2.rectangle(result_img, (x, y), (x + w, y + h), color, 2)
        
        # Add label
        label = f"{class_name}: {confidence:.2f}"
        cv2.putText(result_img, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    
    # Save the output image
    cv2.imwrite(output_path, result_img)
    
    # Encode images as base64
    original_base64 = encode_image_to_base64(image_path)
    processed_base64 = encode_image_to_base64(output_path)
    
    # Return detection results
    result = {
        "id": detection_id,
        "originalImage": f"data:image/jpeg;base64,{original_base64}",
        "processedImage": f"data:image/jpeg;base64,{processed_base64}",
        "detections": detections
    }
    
    return result

def main():
    """Main function"""
    # Parse arguments
    args = parse_arguments()
    
    try:
        # Detect symbols
        result = detect_symbols(
            args.image, 
            args.output, 
            conf_threshold=args.conf_thres,
            iou_threshold=args.iou_thres
        )
        
        # Print results as JSON
        print(json.dumps(result))
        
    except Exception as e:
        # Print error as JSON
        error = {"error": str(e)}
        print(json.dumps(error))
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())