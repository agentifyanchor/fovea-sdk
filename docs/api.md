# Fovea SDK: API Reference

This document provides a deep dive into the `FoveaEngine` class and its configuration options.

## Class: `FoveaEngine`

The main entry point for the Foveated Streaming engine.

### Constructor

```javascript
new FoveaEngine(config)
```

**Parameters:**

*   **`config`** *(Object, optional)*: Configuration object.
    *   **`blurAmount`** *(string, default: `'8px'`)  *
        CSS filter string used for the blurred background.
        *   Example: `'12px'`, `'0.5rem'`.
    *   **`diffThreshold`** *(number, default: `30`) *
        Sensitivity for detecting changes (0-255).
        *   Lower values (e.g., `10`) make the engine more sensitive, detecting subtle changes but potentially increasing bandwidth.
        *   Higher values (e.g., `50`) ignore minor noise/compression artifacts.
    *   **`debug`** *(boolean, default: `false`) *
        Reserved for future use (enabling console logs or visual debug overlays).

---

### Method: `initialize`

Loads and instantiates the WebAssembly module. This **must** be called before `process()`.

```javascript
await engine.initialize(options)
```

**Parameters:**

*   **`options`** *(Object)*:
    *   **`wasmPath`** *(string)*:
        *   **In Node.js (Electron)**: Absolute file path to the `.wasm` binary.
        *   **In Browser**: URL path to fetch the `.wasm` file (e.g., `'/assets/fovea.wasm'`).
    *   **`wasmBuffer`** *(ArrayBuffer/Buffer, optional)*:
        *   Directly pass the binary data if you have pre-loaded it using a custom loader. If provided, `wasmPath` is ignored.

**Returns:**
*   `Promise<void>`: Resolves when WASM is ready.

**Throws:**
*   Error if WASM cannot be loaded or instantiated.

---

### Method: `process`

The core rendering loop function. Call this method on every animation frame to generate the foveated view.

```javascript
const result = engine.process(video, outputCanvas)
```

**Parameters:**

*   **`video`** *(HTMLVideoElement)*:
    The source video element. usage: `video.srcObject = navigator.mediaDevices.getUserMedia(...)`.
*   **`outputCanvas`** *(HTMLCanvasElement)*:
    The visible canvas element where the foveated image will be drawn. The engine handles all drawing operations (blurring background, drawing sharp ROI).

**Returns:**

*   **`Object | null`**: Returns `null` if the engine is not initialized or video is paused. Otherwise returns:
    *   **`type`**: `'keyframe'` | `'foveated'`
        *   `'keyframe'`: Full-resolution standard frame (occurs periodically or on large changes).
        *   `'foveated'`: Optimized frame with blurred background and sharp ROI.
    *   **`bbox`**: `{ min_x, max_x, min_y, max_y, changed }`
        *   The bounding box of the detected change region.
    *   **`isKeyframe`**: *(boolean)* Helper flag.

---

### Example: Custom Sensitivity

```javascript
// High sensitivity for text/code streaming
const engine = new FoveaEngine({ 
    blurAmount: '4px', 
    diffThreshold: 15 
});

await engine.initialize({ wasmPath: '/assets/fovea.wasm' });
```
