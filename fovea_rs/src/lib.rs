use wasm_bindgen::prelude::*;

// Define a Struct to return multiple values easily
#[wasm_bindgen]
pub struct BoundingBox {
    pub min_x: u32,
    pub max_x: u32,
    pub min_y: u32,
    pub max_y: u32,
    pub changed: bool,
}

#[wasm_bindgen]
pub fn calculate_diff(
    current_frame: &[u8],
    prev_frame: &[u8],
    width: u32,
    height: u32,
    threshold: u8
) -> BoundingBox {
    let mut min_x = width;
    let mut max_x = 0;
    let mut min_y = height;
    let mut max_y = 0;
    let mut changed = false;

    // Direct memory access (Simple loop for now, SIMD later)
    // format: [R, G, B, A, R, G, B, A, ...]
    for i in (0..current_frame.len()).step_by(4) {
        let r_diff = (current_frame[i] as i16 - prev_frame[i] as i16).abs();
        let g_diff = (current_frame[i+1] as i16 - prev_frame[i+1] as i16).abs();
        let b_diff = (current_frame[i+2] as i16 - prev_frame[i+2] as i16).abs();

        if (r_diff + g_diff + b_diff) > (threshold as i16) {
            let px_index = (i / 4) as u32;
            let x = px_index % width;
            let y = px_index / width;

            if x < min_x { min_x = x; }
            if x > max_x { max_x = x; }
            if y < min_y { min_y = y; }
            if y > max_y { max_y = y; }
            changed = true;
        }
    }

    if !changed {
        // Return mostly empty if no change
        return BoundingBox {
            min_x: 0, max_x: 0, min_y: 0, max_y: 0, changed: false
        };
    }

    BoundingBox {
        min_x,
        max_x, 
        min_y,
        max_y,
        changed
    }
}
