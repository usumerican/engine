import { initEngine } from './engine';

let engine;

self.onmessage = async (ev) => {
  const { id, request } = ev.data;
  try {
    if (!engine) {
      engine = await initEngine();
    }
    const response = engine.run(request);
    self.postMessage({ id, response });
  } catch (error) {
    self.postMessage({ id, error });
  }
};
