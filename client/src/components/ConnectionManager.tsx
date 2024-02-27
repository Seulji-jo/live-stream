import { socket } from '../socket';

export function ConnectionManager() {
  function connect() {
    console.log('try to connect...');
    console.log(socket);

    socket.connect();
    console.log('Connected');
  }

  function disconnect() {
    console.log('try to disconnect...');
    socket.disconnect();
    console.log('Disconnected');
  }

  return (
    <>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </>
  );
}
