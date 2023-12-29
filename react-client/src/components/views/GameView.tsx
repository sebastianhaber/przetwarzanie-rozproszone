import { makeGuess } from '@/api/api';
import { useSignalR } from '@/context/SignalRContext';
import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';

type Props = { connectedUsers: string[]; messages: string[] };
const GameView = ({ connectedUsers, messages }: Props) => {
  const { hubConnection, userInfo } = useSignalR();
  const { toast } = useToast();
  const guessRef = useRef<HTMLInputElement>(null);
  const bottomLineRef = useRef<HTMLLIElement>(null);
  const [gameOverMessage, setGameOverMessage] = useState<string>('');

  const somebodyWon = useMemo(() => !!messages.find((el) => el.includes('wygrał grę z liczbą: ')), [messages]);
  const areControlsDisabled = connectedUsers.length < 2 || gameOverMessage.length > 0 || somebodyWon;

  const handleMakeGuess = async (e: FormEvent) => {
    e.preventDefault();
    if (!hubConnection || !guessRef.current || !userInfo) return;

    const guessNumber = +guessRef.current?.value.trim();

    if (guessNumber === undefined) {
      toast({ title: 'Wprowadź liczbę' });
      return;
    }
    await makeGuess(hubConnection, userInfo.roomName, userInfo.userName, guessNumber);
    guessRef.current.value = '';
  };

  const ReceivePrivateMessageListener = () => {
    if (!hubConnection || !userInfo) return;

    hubConnection.on('ReceivePrivateMessage', (userName: string, message: string) => {
      if (userName === userInfo.userName) {
        toast({ title: message });
      }
    });
  };
  const GameOverListener = () => {
    if (!hubConnection || !userInfo) return;

    hubConnection.on('GameOver', (userName: string, message: string) => {
      setGameOverMessage(message);
      if (userName === userInfo.userName) {
        toast({ title: 'Brawo! Wygrałeś grę!' });
      }
    });
  };
  const initializeListeners = () => {
    if (!hubConnection) return;

    ReceivePrivateMessageListener();
    GameOverListener();
  };

  useEffect(() => {
    initializeListeners();
  }, []);
  useLayoutEffect(() => {
    if (bottomLineRef.current) {
      console.log('scroll');
      bottomLineRef.current.scrollIntoView({
        behavior: 'instant',
      });
    }
  }, [messages]);

  if (!userInfo) return null;
  return (
    <div className="flex">
      <aside className="max-w-xs w-full bg-secondary p-4 flex flex-col gap-2 h-screen overflow-y-auto">
        <p>Pokój: {userInfo.roomName}</p>
        <p>Nazwa użytkownika: {userInfo.userName}</p>{' '}
        <section>
          <p>Zalogowani użytkownicy:</p>
          <ul className="list-decimal ml-6">
            {connectedUsers.map((user, index) => (
              <li key={index}>
                {user} {user === userInfo.userName && <span className="text-primary font-bold">(Ty)</span>}
              </li>
            ))}
          </ul>
        </section>
      </aside>
      <section className="w-full p-4 space-y-2 max-w-3xl mx-auto">
        <ul className="h-[calc(100vh-2rem-.5rem-3rem)] overflow-y-auto">
          <li>Czat:</li>
          {messages.map((msg, index) => (
            <li key={index} className="even:bg-secondary p-2 rounded">
              {msg}
            </li>
          ))}
          {(somebodyWon || gameOverMessage.length > 0) && (
            <li className="text-destructive font-bold p-2 bg-destructive/10 rounded">Gra została zakończona.</li>
          )}
          {connectedUsers.length < 2 && !gameOverMessage.length && !somebodyWon && (
            <li className="text-destructive font-bold p-2 bg-destructive/10 rounded">
              Oczekiwanie na drugiego gracza...
            </li>
          )}
          <li className="opacity-0" ref={bottomLineRef}>
            xd
          </li>
        </ul>
        <form onSubmit={handleMakeGuess} className="flex gap-2 h-12">
          <Input
            placeholder="Zgadnij liczbę"
            type="number"
            ref={guessRef}
            autoFocus
            disabled={areControlsDisabled}
            className="appearance-none"
            step={1}
            max={100}
            min={1}
          />
          <Button type="submit" disabled={areControlsDisabled}>
            Zgadnij
          </Button>
        </form>
      </section>
    </div>
  );
};

export default GameView;
