import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <button>
        <a
          href={`https://accounts.google.com/o/oauth2/auth?client_id=${`448940645981-3kp181mdmltl6bfltpvvso2v1vlt8h6e.apps.googleusercontent.com`}&redirect_uri=http://localhost:3000/auth/google&scope=https://www.googleapis.com/auth/youtube&response_type=token`}
          target="_blank"
          rel="noreferrer"
        >
          google login
        </a>
      </button>
    </div>
  );
}

export default App;
