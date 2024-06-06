import * as engine from './engine.js';

onload = async () => {
  await engine.init();
  const responseOutput = document.getElementById('responseOutput');
  responseOutput.textContent += 'engine\n';
  responseOutput.textContent += `add: ${engine.add(1, 2)}\n`;
};
