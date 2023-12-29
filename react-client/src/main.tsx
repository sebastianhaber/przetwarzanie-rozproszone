import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from './components/ui/toaster.tsx';
import { SignalRProvider } from './context/SignalRContext.tsx';
import './index.css';
import GamePage from './pages/GamePage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <GamePage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster />
    <SignalRProvider>
      <RouterProvider router={router} />
    </SignalRProvider>
  </React.StrictMode>,
);

