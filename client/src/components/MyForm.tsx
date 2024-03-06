import { ButtonHTMLAttributes, FormEvent, MouseEvent, useState } from 'react';
import { socket } from '../utils/socket';
import { useNavigate } from 'react-router-dom';

export function MyForm() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    socket.timeout(5000).emit('join_room', value, () => {
      setIsLoading(false);
      navigate({ pathname: '/room', search: `?room=${value}` });
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor="room_name"
      >
        Room Name
        <input
          id="room_name"
          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onChange={(e) => setValue(e.target.value)}
        />
      </label>

      <div className="w-full flex  gap-2">
        <button
          className="flex-grow inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          type="submit"
          disabled={isLoading}
        >
          Create
        </button>
        <button className="flex-grow inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2">
          Cancel
        </button>
      </div>
    </form>
  );
}
