"""
Generate a cinematic 1080p H.264 seamless looping background video for Samooh.
Features:
- Scene 1: Kirana Store at dawn (shopkeeper arranging store)
- Scene 2: Wholesale grain mandi & warehouse logistics (stacks of sacks & trolley)
- Scene 3: Goods delivery via Tata Ace mini truck in Indian neighborhood
- Scene 4: Kirana staples weighing & packaging (rice, dal, spices on scale)
- Slow, cinematic Ken-Burns camera push-in and panning
- Smooth cross-dissolves between scenes
- Seamless loop back from Scene 4 to Scene 1
"""

import os
from PIL import Image
import numpy as np
import imageio.v2 as imageio

WIDTH = 1920
HEIGHT = 1080
FPS = 24
SCENE_DURATION_SEC = 4.5
TRANSITION_DURATION_SEC = 1.0
TOTAL_DURATION_PER_SCENE = SCENE_DURATION_SEC + TRANSITION_DURATION_SEC

IMAGE_PATHS = [
    "public/images/kirana_store_dawn.jpg",
    "public/images/wholesale_mandi_logistics.jpg",
    "public/images/goods_delivery_transit.jpg",
    "public/images/kirana_staples_weighing.jpg"
]

OUTPUT_VIDEO = "public/videos/samooh_documentary_loop.mp4"

def load_images():
    images = []
    for path in IMAGE_PATHS:
        img = Image.open(path).convert("RGB")
        # Ensure aspect ratio is 16:9
        img_aspect = img.width / img.height
        target_aspect = WIDTH / HEIGHT
        if img_aspect > target_aspect:
            new_width = int(img.height * target_aspect)
            left = (img.width - new_width) // 2
            img = img.crop((left, 0, left + new_width, img.height))
        elif img_aspect < target_aspect:
            new_height = int(img.width / target_aspect)
            top = (img.height - new_height) // 2
            img = img.crop((0, top, img.width, top + new_height))
        img = img.resize((WIDTH + 200, HEIGHT + 112), Image.Resampling.LANCZOS)
        images.append(img)
    return images

def render_frame_for_scene(img, progress, motion_type="zoom_in"):
    # Subtle cinematic motion: ~5-7% zoom or slow drift
    max_dx = img.width - WIDTH
    max_dy = img.height - HEIGHT
    
    if motion_type == "zoom_in":
        # Start at 1.0, gently push in towards center
        scale = 1.0 - progress * 0.05
        crop_w = int(img.width * scale)
        crop_h = int(img.height * scale)
        left = int((img.width - crop_w) / 2 + progress * 10)
        top = int((img.height - crop_h) / 2)
        cropped = img.crop((left, top, left + crop_w, top + crop_h))
        return np.array(cropped.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR))
    
    elif motion_type == "pan_right":
        # Slow pan across scene
        left = int(max_dx * progress)
        top = int(max_dy * 0.5)
        crop_w = WIDTH
        crop_h = HEIGHT
        cropped = img.crop((left, top, left + crop_w, top + crop_h))
        return np.array(cropped)
    
    elif motion_type == "pan_left":
        left = int(max_dx * (1.0 - progress))
        top = int(max_dy * 0.3)
        crop_w = WIDTH
        crop_h = HEIGHT
        cropped = img.crop((left, top, left + crop_w, top + crop_h))
        return np.array(cropped)
    
    else:
        # Subtle drift
        left = int(max_dx * 0.5 + progress * 20)
        top = int(max_dy * 0.5 - progress * 10)
        crop_w = WIDTH
        crop_h = HEIGHT
        cropped = img.crop((left, top, left + crop_w, top + crop_h))
        return np.array(cropped)

def generate_video():
    print(f"Loading {len(IMAGE_PATHS)} source scenes...")
    images = load_images()
    num_scenes = len(images)
    
    motion_types = ["zoom_in", "pan_right", "pan_left", "zoom_in"]
    
    frames_per_scene = int(FPS * SCENE_DURATION_SEC)
    transition_frames = int(FPS * TRANSITION_DURATION_SEC)
    
    os.makedirs(os.path.dirname(OUTPUT_VIDEO), exist_ok=True)
    
    # We use ffmpeg writer with H.264 encoding and web-optimized crf & bitrate
    writer = imageio.get_writer(
        OUTPUT_VIDEO,
        fps=FPS,
        codec='libx264',
        quality=8,
        macro_block_size=1,
        pixelformat='yuv420p',
        ffmpeg_params=[
            '-preset', 'fast',
            '-movflags', '+faststart',
            '-tune', 'film'
        ]
    )
    
    print(f"Rendering {num_scenes} scenes into {OUTPUT_VIDEO} ({FPS} FPS)...")
    
    total_frames = 0
    for i in range(num_scenes):
        curr_img = images[i]
        next_img = images[(i + 1) % num_scenes]
        curr_motion = motion_types[i]
        next_motion = motion_types[(i + 1) % num_scenes]
        
        # 1. Main scene duration
        for f in range(frames_per_scene):
            progress = f / (frames_per_scene + transition_frames)
            frame = render_frame_for_scene(curr_img, progress, curr_motion)
            writer.append_data(frame)
            total_frames += 1
            
        # 2. Cross-dissolve transition into next scene
        for t in range(transition_frames):
            alpha = t / transition_frames
            # Ease in-out curve for smooth documentary feel
            blend = 0.5 * (1.0 - np.cos(np.pi * alpha))
            
            p_curr = (frames_per_scene + t) / (frames_per_scene + transition_frames)
            p_next = t / (frames_per_scene + transition_frames)
            
            frame_curr = render_frame_for_scene(curr_img, p_curr, curr_motion).astype(np.float32)
            frame_next = render_frame_for_scene(next_img, p_next, next_motion).astype(np.float32)
            
            blended = ((1.0 - blend) * frame_curr + blend * frame_next).astype(np.uint8)
            writer.append_data(blended)
            total_frames += 1
            
    writer.close()
    file_size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)
    duration_sec = total_frames / FPS
    print(f"Successfully generated {OUTPUT_VIDEO}!")
    print(f"Duration: {duration_sec:.1f}s, Total Frames: {total_frames}, File Size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    generate_video()
