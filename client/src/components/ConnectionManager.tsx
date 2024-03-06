import { socket } from '../utils/socket';

export function ConnectionManager() {
  function connect() {
    console.log('try to connect...');
    socket.connect();
    console.log(socket);

    console.log('Connected');
  }

  function disconnect() {
    console.log('try to disconnect...');
    socket.disconnect();
    console.log('Disconnected');
  }

  return (
    <div className="flex gap-4">
      <button
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
        onClick={connect}
      >
        Connect
      </button>
      <button
        className="rounded-md border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black focus:outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/75"
        onClick={disconnect}
      >
        Disconnect
      </button>
    </div>
  );
}
