import { RouterProvider, createBrowserRouter } from 'react-router-dom';
// import './App.css';
import Room from './pages/Room';
import RoomList from './pages/RoomList';

function App() {
  const router = createBrowserRouter([
    { path: '/', element: <RoomList /> },
    {
      path: 'room',
      element: <Room />,
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
