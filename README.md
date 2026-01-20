
# Hybrid AR Engine – Stage-2 + Stage-3 (Working)

This is a WORKING hybrid WebAR engine with:
- Real image tracking (MindAR)
- Hybrid state machine (ACTIVE / LOCKED / LOST)
- Stable HTML video rendering (no WebGL rendering)

## Behavior
- ACTIVE: video follows the frame
- LOCKED: video freezes when tracking weak
- LOST: video fades out when frame disappears

## How to run
1. Host on HTTPS (GitHub Pages / Vercel)
2. Replace assets/target.mind with your target
3. Replace assets/demo.mp4 with your video
4. Open link on mobile browser
