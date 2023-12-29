export const joinRoom = (hubConnection: signalR.HubConnection, roomName: string, userName: string) =>
  hubConnection.invoke('JoinRoom', roomName, userName).catch((err) => console.error(err.toString()));
export const leaveRoom = (hubConnection: signalR.HubConnection, roomName: string, userName: string) =>
  hubConnection.invoke('LeaveRoom', roomName, userName).catch((err) => console.error(err.toString()));

export const makeGuess = (hubConnection: signalR.HubConnection, roomName: string, userName: string, number: number) =>
  hubConnection
    .invoke('MakeGuess', roomName, userName, number, hubConnection.connectionId)
    .catch((err) => console.error(err.toString()));

export const subscribeUsersInRoom = (hubConnection: signalR.HubConnection, setUsers: (users: string[]) => void) =>
  hubConnection.on('UpdateUsers', setUsers);
export const unSubscribeUsersInRoom = (hubConnection: signalR.HubConnection, setUsers: (users: string[]) => void) =>
  hubConnection.off('UpdateUsers', setUsers);
