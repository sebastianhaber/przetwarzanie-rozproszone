import LoadingIcon from '@/components/ui/loading-icon';
import { useToast } from '@/components/ui/use-toast';
import * as signalR from '@microsoft/signalr';
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react';

type TUserInfo = {
  userName: string;
  roomName: string;
};
interface Context {
  hubConnection: signalR.HubConnection | undefined;
  userInfo: TUserInfo | undefined;
  setUserInfo: Dispatch<SetStateAction<TUserInfo | undefined>>;
}
const SignalRContext = createContext<Context>({
  hubConnection: undefined,
  setUserInfo: () => null,
  userInfo: undefined,
});

const API_URL = 'https://localhost:7126';
let hubConnection = new signalR.HubConnectionBuilder().withUrl(API_URL + '/gameHub').build();

type Props = {
  children: ReactNode;
};
export const SignalRProvider = ({ children }: Props) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState<TUserInfo | undefined>(undefined);

  const connect = async () => {
    setLoading(true);
    if (hubConnection.state !== 'Disconnected') return;
    await hubConnection
      .start()
      .then((res) => {
        console.log('Połączono z serwerem SignalR');
        setLoading(false);
        console.log(res);
        return res;
      })
      .catch((error) => {
        console.error('Błąd podczas łączenia z serwerem SignalR', error);
      });
  };
  useEffect(() => {
    connect();

    let lastStatus = '';
    const interval = setInterval(() => {
      if (!lastStatus) {
        lastStatus = 'Connecting';
        toast({ title: 'Connecting' });
      } else if (lastStatus !== hubConnection.state) {
        console.log(hubConnection.state);
        lastStatus = hubConnection.state;
        toast({ title: hubConnection.state });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (isLoading)
    return (
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoadingIcon className="w-4 h-4" />
      </div>
    );
  return <SignalRContext.Provider value={{ hubConnection, setUserInfo, userInfo }}>{children}</SignalRContext.Provider>;
};

export const useSignalR = () => {
  return useContext(SignalRContext);
};
