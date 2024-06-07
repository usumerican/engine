import instatiate from '../dist/bin/engine.wasm?init';

export async function initEngine() {
  const memory = new WebAssembly.Memory({ initial: 32, maximum: 1024 });
  const instance = await instatiate({ env: { memory, dateNow: () => BigInt(Date.now()) } });

  class Slice {
    static encoder = new TextEncoder();
    static decoder = new TextDecoder();

    constructor(value) {
      this.value = value;
      this.addr = instance.exports.sliceAddr(this.value) >>> 0;
      if (!this.addr) {
        throw new Error('Slice.addr is null.');
      }
      this.len = instance.exports.sliceLen(this.value) >>> 0;
    }

    static alloc(str) {
      const arr = Slice.encoder.encode(str);
      const slice = new Slice(instance.exports.sliceAlloc(arr.length));
      if (slice.len) {
        new Uint8Array(memory.buffer, slice.addr, slice.len).set(arr);
      }
      return slice;
    }

    free() {
      instance.exports.sliceFree(this.value);
    }

    decode() {
      return this.len ? Slice.decoder.decode(new Uint8Array(memory.buffer, this.addr, this.len)) : '';
    }
  }

  return {
    run(request) {
      const request_slice = Slice.alloc(request);
      try {
        const response_slice = new Slice(instance.exports.run(request_slice.value));
        try {
          return response_slice.decode();
        } finally {
          response_slice.free();
        }
      } finally {
        request_slice.free();
      }
    },
  };
}
