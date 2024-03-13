import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.SOCKET_URL ?? 'ws://localhost:3000';
console.log(process.env.NODE_ENV);
console.log(process.env.SOCKET_URL);
console.log(URL);

export const socket = io(URL, {
  // autoConnect: false,
  // auth: {
  //   token: '123',
  // },
  // query: {
  //   'my-key': 'my-value',
  // },
});
