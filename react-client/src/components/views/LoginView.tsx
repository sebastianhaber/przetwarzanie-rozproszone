import { joinRoom } from '@/api/api';
import { useSignalR } from '@/context/SignalRContext';
import { FormEvent, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';

const LoginView = () => {
  const { hubConnection, setUserInfo } = useSignalR();
  const { toast } = useToast();

  const roomRef = useRef<HTMLInputElement>(null);
  const userNameRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!hubConnection) return;

    const roomName = roomRef.current?.value.trim();
    const userName = userNameRef.current?.value.trim();

    if (!roomName || !userName) {
      toast({ title: 'Podaj nazwę pokoju i nazwę użytkownika' });
      return;
    }
    await joinRoom(hubConnection, roomName, userName).then(() => {
      setUserInfo({
        roomName,
        userName,
      });
    });
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col gap-4 bg-secondary p-4 max-w-lg w-full rounded mx-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <Input placeholder="Wpisz nazwę pokoju" ref={roomRef} autoFocus />
      <Input placeholder="Wpisz nazwę użytkownika" ref={userNameRef} />
      <Button type="submit">Graj</Button>
    </form>
  );
};

export default LoginView;
