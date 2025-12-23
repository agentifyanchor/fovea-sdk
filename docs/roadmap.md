# Future Roadmap: Fovea v2.0 🧠

As we push the boundaries of real-time vision, we plan to implement advanced mathematical optimization techniques.

## 1. Entropy Coding (The "Squeeze")
**Status:** Research Phase

We currently transmit raw pixel diffs. By analyzing the frequency distribution of these changes, we can implement **Entropy Coding** (Huffman or Arithmetic Coding) to represent frequent small changes with fewer bits.

### Mathematical Approach
*   Calculate the probability $P(x)$ of each pixel value $x$ in the diff stream.
*   Assign code lengths $L(x) \approx -\log_2 P(x)$.
*   **Target:** Reduce bandwidth by an additional **30-40%** without loss of quality.

## 2. Motion Estimation (The "Prediction")
**Status:** Planned

Instead of re-transmitting pixels when a window moves, we will transmit a **Motion Vector**.

### Mathematical Model: Block Matching
We minimize the Sum of Absolute Differences (SAD) to find the best matching block in the previous frame:

$$ (u, v) = \arg \min_{(u, v)} \sum_{x, y} | I_t(x, y) - I_{t-1}(x+u, y+v) | $$

*   **Result:** Window dragging operations will consume **near-zero bandwidth**, as we only send the vector $(u,v)$ rather than the pixel data.

## 3. Perceptual Quantization
**Status:** Planned

We will implement **Content-Adaptive Quantization** based on local variance $\sigma^2$ (texture complexity). High-texture regions (like trees) mask compression artifacts better than flat regions (like blue sky), allowing for aggressive quantization where the eye simply can't tell the difference.
