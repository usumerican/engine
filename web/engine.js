import instatiate from '../dist/bin/engine.wasm?init';

export class Engine {
  constructor(memory, instance) {
    this.memory = memory;
    this.instance = instance;
  }

  static async init() {
    const memory = new WebAssembly.Memory({ initial: 32, maximum: 40 });
    const instance = await instatiate({ env: { memory, dateNow: () => BigInt(Date.now()) } });
    return new Engine(memory, instance);
  }

  static encoder = new TextEncoder();
  static decoder = new TextDecoder();

  sliceAddr(slice) {
    return this.instance.exports.sliceAddr(slice) >>> 0;
  }

  sliceLen(slice) {
    return this.instance.exports.sliceLen(slice) >>> 0;
  }

  sliceEncode(str) {
    const arr = Engine.encoder.encode(str);
    const slice = this.instance.exports.sliceAlloc(arr.length);
    const addr = this.sliceAddr(slice);
    if (!addr) {
      throw new Error('sliceEncode addr is null');
    }
    const len = this.sliceLen(slice);
    if (len) {
      new Uint8Array(this.memory.buffer, addr, len).set(arr);
    }
    return slice;
  }

  sliceDecode(slice) {
    const addr = this.sliceAddr(slice);
    if (!addr) {
      throw new Error('sliceDecode addr is null');
    }
    const len = this.sliceLen(slice);
    return len ? Engine.decoder.decode(new Uint8Array(this.memory.buffer, addr, len)) : '';
  }

  sliceFree(slice) {
    this.instance.exports.sliceFree(slice);
  }

  run(request) {
    const request_slice = this.sliceEncode(request);
    try {
      const response_slice = this.instance.exports.run(request_slice);
      try {
        return this.sliceDecode(response_slice);
      } finally {
        this.sliceFree(response_slice);
      }
    } finally {
      this.sliceFree(request_slice);
    }
  }
}

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
