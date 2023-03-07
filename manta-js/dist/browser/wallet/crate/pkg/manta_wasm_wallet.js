import * as wasm from "./manta_wasm_wallet_bg.wasm";
import { __wbg_set_wasm } from "./manta_wasm_wallet_bg.js";
__wbg_set_wasm(wasm);
export * from "./manta_wasm_wallet_bg.js";
