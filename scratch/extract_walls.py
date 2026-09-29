import cv2
import numpy as np
import json
import sys

def process_floorplan(img_path, out_path, scene_width=20):
    # Load image
    img = cv2.imread(img_path)
    if img is None:
        print("Failed to load image")
        return
    
    h, w = img.shape[:2]
    aspect = w / h
    scene_height = scene_width / aspect

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Floor plan walls are typically dark. We invert so walls are white on black background.
    # First, let's blur slightly to remove noise.
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Thresholding. Assuming white background, we want to isolate dark lines (walls).
    _, thresh = cv2.threshold(blurred, 100, 255, cv2.THRESH_BINARY_INV)
    
    # Morphological operations to connect broken wall segments
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=2)
    eroded = cv2.erode(dilated, kernel, iterations=1)
    
    # Find contours
    contours, hierarchy = cv2.findContours(eroded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    wall_shapes = []
    
    for cnt in contours:
        # Filter small noise contours
        area = cv2.contourArea(cnt)
        if area < 100:  # Minimum area threshold
            continue
            
        # Simplify contour
        epsilon = 0.005 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        
        # Convert to Three.js scene coordinates
        # OpenCV origin is top-left. Three.js is center.
        shape_pts = []
        for pt in approx:
            x_px, y_px = pt[0]
            # Map x_px from [0, w] to [-scene_width/2, scene_width/2]
            x_3d = (x_px / w) * scene_width - (scene_width / 2)
            
            # Map y_px from [0, h] to [-scene_height/2, scene_height/2]. 
            # Note: in Three.js, Y is up, but on our Plane (rotated -90deg on X), Z is forward/back.
            # So y_px maps to z_3d. 
            z_3d = (y_px / h) * scene_height - (scene_height / 2)
            
            shape_pts.append([x_3d, z_3d])
            
        wall_shapes.append(shape_pts)
        
    # Write to JSON
    with open(out_path, 'w') as f:
        json.dump(wall_shapes, f)
        
    print(f"Extracted {len(wall_shapes)} wall contours.")

if __name__ == '__main__':
    for i in range(1, 6):
        process_floorplan(f'scratch/floorplan{i}.jpg', f'apps/web/public/floorplans/walls{i}.json')
