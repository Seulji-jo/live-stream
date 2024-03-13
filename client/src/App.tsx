import { RouterProvider, createBrowserRouter } from 'react-router-dom';
// import './App.css';
import Room from './pages/Room';
import RoomList from './pages/RoomList';
import ChatRoom from './pages/ChatRoom';

function App() {
  const router = createBrowserRouter([
    { path: '/', element: <RoomList /> },
    {
      path: 'room',
      // element: <Room />,
      element: <ChatRoom />,
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
