import init, { FoveaEngine } from '../../fovea_rs/pkg/fovea_wasm.js';

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

// 1. Initialize WASM
async function main() {
    try {
        log("Loading WebAssembly...", "info");
        // Point to the .wasm file in the package
        await init('../../fovea_rs/pkg/fovea_wasm_bg.wasm');
        engine = new FoveaEngine("8px", 30); // 8px blur, 30 threshold
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
