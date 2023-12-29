import { leaveRoom, subscribeUsersInRoom, unSubscribeUsersInRoom } from '@/api/api';
import GameView from '@/components/views/GameView';
import LoginView from '@/components/views/LoginView';
import { useSignalR } from '@/context/SignalRContext';
import { useEffect, useState } from 'react';

const GamePage = () => {
  const { userInfo, hubConnection } = useSignalR();
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!hubConnection) return;
    subscribeUsersInRoom(hubConnection, setConnectedUsers);
    hubConnection.on('UpdateMessages', (messages: string[]) => {
      setMessages(messages);
    });

    return () => {
      unSubscribeUsersInRoom(hubConnection, setConnectedUsers);
    };
  }, []);
  useEffect(() => {
    if (!userInfo?.roomName || !hubConnection) return;
    const beforeUnloadEvent = () => {
      leaveRoom(hubConnection, userInfo.roomName, userInfo.userName);
      console.log('leave');
    };

    window.addEventListener('beforeunload', beforeUnloadEvent);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadEvent);
    };
  }, [userInfo?.roomName]);

  if (!userInfo?.userName) {
    return <LoginView />;
  }
  return <GameView connectedUsers={connectedUsers} messages={messages} />;
};

export default GamePage;
