# Contributing to Fovea SDK

Thank you for your interest in contributing! 🚀
Since Fovea uses a **Rust + WebAssembly (WASM)** architecture, there are two ways to interact with this project.

## 1. Consumer Mode (Just using it in a Web App)
If you just want to *build a web app* with Fovea, you **DO NOT** need Rust.
*   The WASM binary is pre-compiled in `fovea_rs/pkg`.
*   Just `npm install` and use it like any JS library.

## 2. Contributor Mode (Modifying the Core Engine) 🛠️
If you want to improve the core logic (Diffing, Compression, Math), you need to re-compile the Rust code.

### Prerequisites
1.  **Rust Toolchain**: [Install Rust](https://rustup.rs/) (`cargo --version` should work).
2.  **WASM Pack**: The standard tool for building Rust for the web.
    ```bash
    cargo install wasm-pack
    ```

### Build Workflow
1.  **Modify Rust Code**: Edit files in `fovea_rs/src/lib.rs`.
2.  **Compile to WASM**:
    Run this command from the root folder:
    ```bash
    cd fovea_rs
    wasm-pack build --target web
    ```
3.  **Validate**: This will update the `fovea_rs/pkg` directory with the new `.wasm` and `.js` glue code.

### Project Structure
*   `/fovea_rs`: The **Rust** Source Code (The Engine).
*   `/docs`: Documentation Site.
*   `index.js`: The **JavaScript** Wrapper (The Bridge).

### Submitting a Pull Request
1.  Ensure you have re-compiled the WASM binary (`wasm-pack build`) if you changed Rust code.
2.  Push your changes and open a PR to `main`.
