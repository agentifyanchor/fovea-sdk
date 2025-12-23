# Fovea SDK - Simple JS Example 🚀

This is a "fluid simple" example showing how to use Fovea with plain JavaScript.

## Features
*   **Screen Sharing**: Basic capture flow.
*   **Comparison**: See Raw Stream vs. Foveated Stream side-by-side.
*   **Real-time Stats**: Track bandwidth savings.
*   **AI Hook**: Code comments showing exactly where to insert your AI analysis logic.

## How to Run
Since this uses WebAssembly, it must be served via a web server (you cannot just double-click `index.html`).

1. Open a terminal in this folder:
   ```bash
   cd examples/vanilla-js
   ```

2. Start a local server:
   ```bash
   npx serve .
   ```

3. Open the URL shown (usually `http://localhost:3000`).

## Worker vs Main Thread Considerations
*   **For UI/Widget**: Main thread (like this example) is usually fine and easiest to debug.
*   **For Heavy Load**: Use a Web Worker.
    *   **What to import?** Inside the worker, you still import the `.js` file (e.g., `import init from './fovea_rs/pkg/fovea_wasm.js'`).
    *   **Why?** The `.js` file contains the "glue code" that loads the `.wasm` file for you. You rarely load `.wasm` manually directly.
