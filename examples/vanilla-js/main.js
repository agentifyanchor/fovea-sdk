import init, { calculate_diff } from './fovea-lib/fovea_wasm.js';

// DOM Elements
const videoSource = document.getElementById('videoSource');
const canvasOutput = document.getElementById('canvasOutput');
const ctx = canvasOutput.getContext('2d');
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const logPanel = document.getElementById('logPanel');
const statsOriginal = document.getElementById('statsOriginal');
const statsFovea = document.getElementById('statsFovea');

let engine = null;
let isRunning = false;
let animationId = null;

// Logger
function log(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = `log-entry log-${type}`;
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logPanel.prepend(div);
}

// ---------------------------------------------------------
// 🧠 The Fovea Engine Class (JS Wrapper)
// ---------------------------------------------------------
class FoveaEngine {
    constructor(blurAmount, diffThreshold) {
        this.blurAmount = blurAmount; // e.g. "8px"
        this.diffThreshold = diffThreshold;
        this.prevFrame = null;

        // Offscreen canvas for raw frame data extraction
        this.offscreen = document.createElement('canvas');
        this.offCtx = this.offscreen.getContext('2d', { willReadFrequently: true });
    }

    process(videoElement, outputCanvas) {
        const w = videoElement.videoWidth;
        const h = videoElement.videoHeight;
        if (!w || !h) return null;

        // Resize canvases if needed
        if (this.offscreen.width !== w || this.offscreen.height !== h) {
            this.offscreen.width = w;
            this.offscreen.height = h;
        }

        // 1. Draw current frame to offscreen canvas
        this.offCtx.drawImage(videoElement, 0, 0, w, h);

        // 2. Get Raw Pixel Data
        const currentFrameData = this.offCtx.getImageData(0, 0, w, h).data;

        // 3. Initialize previous frame if first run
        if (!this.prevFrame) {
            this.prevFrame = new Uint8Array(currentFrameData);
            // Draw full frame
            const ctx = outputCanvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, outputCanvas.width, outputCanvas.height);
            return { type: 'keyframe' };
        }

        // 4. CALL WASM: Calculate Diff
        // Returns a BoundingBox object
        const bbox = calculate_diff(
            currentFrameData,
            this.prevFrame,
            w,
            h,
            this.diffThreshold
        );

        const result = { type: 'noop' };

        if (bbox.changed) {
            // 5. Update Previous Frame for next loop
            this.prevFrame.set(currentFrameData);

            // 6. Draw Foveated View (Blur + Clear ROI)
            const ctx = outputCanvas.getContext('2d');

            // A. Draw blurred background (simulated by drawing full frame with filter)
            // In a real stream, you wouldn't send this, you'd keep the old static background.
            // For visualization here:
            ctx.filter = `blur(${this.blurAmount})`;
            ctx.drawImage(videoElement, 0, 0);
            ctx.filter = 'none';

            // B. Draw High-Res ROI
            const rx = bbox.min_x;
            const ry = bbox.min_y;
            const rw = bbox.max_x - bbox.min_x;
            const rh = bbox.max_y - bbox.min_y;

            if (rw > 0 && rh > 0) {
                ctx.drawImage(videoElement, rx, ry, rw, rh, rx, ry, rw, rh);

                // Draw red border for visualization
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2;
                ctx.strokeRect(rx, ry, rw, rh);

                result.type = 'foveated';
                result.bbox = { x: rx, y: ry, w: rw, h: rh };
            }
        }

        // Free WASM memory for the bbox object
        bbox.free();

        return result;
    }
}

// 1. Initialize WASM
async function main() {
    try {
        log("Loading WebAssembly...", "info");
        await init('./fovea-lib/fovea_wasm_bg.wasm');
        engine = new FoveaEngine("8px", 30);
        log("✅ Fovea Engine Initialized!", "info");
    } catch (e) {
        log(`❌ Error loading WASM: ${e.message}`, "error");
    }
}

// 2. Start Screen Sharing
btnStart.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: 30 } // Throttle at source
        });

        videoSource.srcObject = stream;
        await videoSource.play();

        // set canvas size to match video
        canvasOutput.width = videoSource.videoWidth;
        canvasOutput.height = videoSource.videoHeight;

        log("Started Screen Sharing", "info");

        stream.getVideoTracks()[0].onended = stop;

        btnStart.disabled = true;
        btnStop.disabled = false;
        isRunning = true;

        processLoop();
    } catch (e) {
        log(`User cancelled or error: ${e.message}`, "error");
    }
};

btnStop.onclick = stop;

function stop() {
    isRunning = false;
    cancelAnimationFrame(animationId);
    if (videoSource.srcObject) {
        videoSource.srcObject.getTracks().forEach(t => t.stop());
        videoSource.srcObject = null;
    }
    btnStart.disabled = false;
    btnStop.disabled = true;
    log("Stopped Sharing", "info");
}

// 3. The Processing Loop
function processLoop() {
    if (!isRunning) return;

    const start = performance.now();

    // --- A. Process Frame with Fovea ---
    // The engine takes the video element and draws the result to the canvas
    // It returns 'result' containing the ROI (Region of Interest)
    const result = engine.process(videoSource, canvasOutput);

    const time = (performance.now() - start).toFixed(2);

    // --- B. Update Stats ---
    statsOriginal.textContent = `Res: ${videoSource.videoWidth}x${videoSource.videoHeight}`;

    if (result && result.type === 'foveated') {
        const bbox = result.bbox;
        const roiArea = bbox.w * bbox.h;
        const totalArea = canvasOutput.width * canvasOutput.height;
        const savings = (100 - (roiArea / totalArea * 100)).toFixed(1);

        statsFovea.textContent = `Render: ${time}ms | ROI: ${bbox.w}x${bbox.h} | Savings: ~${savings}%`;

        // --- C. AI HOOK (As requested) ---
        analyzeFrameWithAI(videoSource, bbox);
    } else {
        statsFovea.textContent = `Render: ${time}ms | Mode: Keyframe (Full Update)`;
    }

    animationId = requestAnimationFrame(processLoop);
}

// ---------------------------------------------------------
// 🤖 AI ANALYZER HOOK
// ---------------------------------------------------------
let lastAnalysis = 0;
const ANALYSIS_INTERVAL = 2000; // Only analyze every 2 seconds

async function analyzeFrameWithAI(videoElement, bbox) {
    const now = Date.now();
    if (now - lastAnalysis < ANALYSIS_INTERVAL) return;
    lastAnalysis = now;

    // This is where you would send the frame to your AI
    log(`[AI] Analyzing Region: x=${bbox.x}, y=${bbox.y}, w=${bbox.w}, h=${bbox.h}`, "ai");

    /* 
    IMPLEMENTATION DETAILS:
    
    1. Extract crop:
       const offscreen = new OffscreenCanvas(bbox.w, bbox.h);
       offscreen.getContext('2d').drawImage(videoElement, bbox.x, bbox.y, bbox.w, bbox.h, 0, 0, bbox.w, bbox.h);
       
    2. Convert to Blob:
       const blob = await offscreen.convertToBlob();
       
    3. Send to Server/API:
       const formData = new FormData();
       formData.append('image', blob);
       fetch('/api/analyze', { method: 'POST', body: formData });
    */
}

// Initialize on load
main();
