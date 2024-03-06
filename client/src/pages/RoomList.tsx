import { useEffect, useState } from 'react';
import CreateRoomModal from '../components/CreateRoomModal';
import { ConnectionState } from '../components/ConnectionState';
import { Events } from '../components/Events';
import { ConnectionManager } from '../components/ConnectionManager';
import { socket } from '../utils/socket';
// import { MyForm } from '../components/MyForm';

function RoomList() {
  let [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomList, setRoomList] = useState<string[]>([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function handleRoomList(value: string) {
      console.log(value);

      setRoomList((previous) => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('create_room', handleRoomList);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('create_room', handleRoomList);
    };
  }, []);
  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center gap-10">
      <div>
        <ConnectionState isConnected={isConnected} />

        <ConnectionManager />
      </div>
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
        >
          방 생성하기
        </button>
        <CreateRoomModal
          isOpen={isModalOpen}
          handleClose={() => setIsModalOpen(false)}
        />
      </div>
      <Events events={roomList} />
    </main>
  );
}

export default RoomList;
