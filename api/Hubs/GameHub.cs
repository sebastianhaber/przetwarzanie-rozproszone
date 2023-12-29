using Microsoft.AspNetCore.SignalR;

namespace api.Hubs
{
    public class GameHub : Hub
    {
        private static readonly Dictionary<string, List<string>> ConnectedUsersByRoom = new Dictionary<string, List<string>>();
        private static readonly Dictionary<string, List<string>> MessagesByRoom = new Dictionary<string, List<string>>();
        private static readonly Dictionary<string, int> NumberToGuessByRoom = new Dictionary<string, int>();

        public async Task MakeGuess(string roomName, string userName, int guess, string connectionId)
        {
            var numberToGuess = NumberToGuessByRoom[roomName];
            string result;
            bool isOver = false;

            if (guess < numberToGuess)
            {
                result = "Za mało!";
            }
            else if (guess > numberToGuess)
            {
                result = "Za dużo!";
            }
            else
            {
                result = "Gracz " + userName + " wygrał grę z liczbą: " + guess;
                isOver = true;
            }


            // Zwrot z informacją czy za mało czy za dużo
            await Clients.Client(connectionId).SendAsync("ReceivePrivateMessage", userName,result);

            // Dodanie wiadomości do czatu
            MessagesByRoom[roomName].Add(userName + ": " + guess);

            // Jeśli user wygrał
            if(isOver){
                MessagesByRoom[roomName].Add("--- " + result + " ---");
                await Clients.Group(roomName).SendAsync("GameOver", userName, result);
            }
            await UpdateMessages(roomName);
        }
        public async Task JoinRoom(string roomName, string userName){
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);

            // Tworzenie nowego pokoju
            if (!ConnectedUsersByRoom.ContainsKey(roomName))
            {
                ConnectedUsersByRoom[roomName] = new List<string>();
            }
            // Tworzenie czatu dla pokoju
            if (!MessagesByRoom.ContainsKey(roomName))
            {
                MessagesByRoom[roomName] = new List<string>();
            }

            // Dodanie użytkownika do pokoju
            ConnectedUsersByRoom[roomName].Add(userName);
            // Dodanie wiadomości, że user dołączył do pokoju
            MessagesByRoom[roomName].Add(userName + " dołączył do gry.");

            if (!NumberToGuessByRoom.ContainsKey(roomName))
            {
                // Losowanie liczby
                NumberToGuessByRoom[roomName] = new Random().Next(1, 101);
            }


            await Clients.Group(roomName).SendAsync("UserJoined", userName);
            await Clients.Group(roomName).SendAsync("Number", NumberToGuessByRoom[roomName]);

            await UpdateConnectedUsers(roomName);
            await UpdateMessages(roomName);

            // Po dołączeniu do gry, która się zakończyła
            // ! Jeśli user będzie miał taki nick to wyśle wiadomość - błąd
            if (MessagesByRoom[roomName].FirstOrDefault(msg => msg.Contains("wygrał grę z liczbą:")) != null)
            {
                await Clients.Group(roomName).SendAsync("GameOver", userName, "Gra została zakończona.");
            }
        }
        public async Task LeaveRoom(string roomName, string userName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);

            ConnectedUsersByRoom[roomName]?.Remove(userName);
            // Dodanie wiadomości, że user wyszedł z pokoju
            MessagesByRoom[roomName].Add(userName + " wyszedł z gry.");

            await UpdateConnectedUsers(roomName);
            await UpdateMessages(roomName);
        }

        private async Task UpdateConnectedUsers(string roomName)
        {
            var connectedUsers = ConnectedUsersByRoom[roomName];
            await Clients.Group(roomName).SendAsync("UpdateUsers", connectedUsers);
        }
        private async Task UpdateMessages(string roomName)
        {
            var messages = MessagesByRoom[roomName];
            await Clients.Group(roomName).SendAsync("UpdateMessages", messages);
        }
    }
}