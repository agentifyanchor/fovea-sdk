/* tslint:disable */
/* eslint-disable */

export class BoundingBox {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
  changed: boolean;
}

export function calculate_diff(current_frame: Uint8Array, prev_frame: Uint8Array, width: number, height: number, threshold: number): BoundingBox;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_boundingbox_free: (a: number, b: number) => void;
  readonly __wbg_get_boundingbox_changed: (a: number) => number;
  readonly __wbg_get_boundingbox_max_x: (a: number) => number;
  readonly __wbg_get_boundingbox_max_y: (a: number) => number;
  readonly __wbg_get_boundingbox_min_x: (a: number) => number;
  readonly __wbg_get_boundingbox_min_y: (a: number) => number;
  readonly __wbg_set_boundingbox_changed: (a: number, b: number) => void;
  readonly __wbg_set_boundingbox_max_x: (a: number, b: number) => void;
  readonly __wbg_set_boundingbox_max_y: (a: number, b: number) => void;
  readonly __wbg_set_boundingbox_min_x: (a: number, b: number) => void;
  readonly __wbg_set_boundingbox_min_y: (a: number, b: number) => void;
  readonly calculate_diff: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
