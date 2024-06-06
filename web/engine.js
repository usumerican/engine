import instatiate from '../zig-out/bin/engine.wasm?init';

let memory;
let instance;

export async function init() {
  if (!memory) {
    memory = new WebAssembly.Memory({ initial: 32, maximum: 1024 });
  }
  if (!instance) {
    instance = await instatiate({ env: { memory } });
  }
}

export function add(a, b) {
  return instance.exports.add(a, b);
}
