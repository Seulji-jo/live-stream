import { atom } from 'jotai';

const stream = atom(
  await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  })
);

export { stream };
