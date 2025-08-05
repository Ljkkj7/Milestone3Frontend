<h1 style="text-align:center;"> 📈 market.io </h1>

---

**market.io** is a real-time multiplayer stock trading simulation game. 
Compete with other players by buying and selling virtual stocks, tracking portfolio performance, and climbing the leaderboard — all in a fast-paced, web-based environment.

---

## 🔧 Features

- 💹 Real-time stock price updates
- 🛒 Buy/sell stocks with virtual currency
- 📊 Personal holdings and balance tracking
- 👥 User profiles with levels, top trades and comment section
- 🏆 Leaderboard ranking by levels gained
- 🌐 Live multiplayer powered by WebSockets

---

## 🧰 Tech Stack

| Layer        | Technology                   |
|--------------|-------------------------------|
| Frontend     | HTML, CSS, JavaScript        |
| Game Server  | Node.js + Express             |
| API Backend  | Django + Django REST Framework|
| WebSockets   | Socket.IO                     |
| Database     | PostgreSQL                    |
| Auth         | Django JWT |
| Dev Tools    | VS Code, Git |

## Frontend (Client-Side):

### HTML5 + CSS3: 
For creating the game layout and user interface.

### JavaScript + Node.js + Express:

Node.js is used in conjunction with express to run the frontend server - retrieving and displaying all stock information in real time. 

### WebSockets:

WebSockets enable real-time interaction between the client and server. This would ensure that the stock prices and trades are updated instantly for all players.

### HTML5 Canvas: 
For rendering dynamic, interactive stock market graphs, avatars, and real-time transactions.

## Backend (Server-Side):

### Node.js: 
It’s a non-blocking, event-driven architecture that handles real-time multiplayer games well, especially when paired with WebSockets.

### Express.js: 
A lightweight framework that allows for set up of REST APIs. However, in this project it is used to serve environment variables to the front end through HTML injection.

### WebSocket Server (Socket.IO):

Socket.IO (with Node.js) is great for handling real-time communication, allowing players to see market changes, trade results, and interact with others instantly.

Players' actions like buying/selling stocks should be sent to the server using WebSockets, and the server will push the changes back to all players in real-time.

### API Backend (Django + Django REST Framework):

Django will manage the core business logic (player management, transaction handling, etc.) and interact with PostgreSQL to store and retrieve data.

Django REST Framework will expose API endpoints for the frontend to interact with the database (e.g., fetching stock data, updating player portfolios, storing transactions).

### Authentication (Django JWT):

The authentication system in Django will handle user login, registration, and management.

### Database (postgreSQL):

PostgreSQL can handle large amounts of data and complex queries efficiently, making it a solid choice for multiplayer games with real-time data.

## Dev Tools (VS Code, Git):
VS Code: The IDE with the tools for front-end & back-end development. With extensions for both Djano and Node.js.

Git: Use Git for version control.

---

## Game Design Considerations:

### Stock Trading Mechanic: 
In the game, players can buy/sell stocks from various companies (real or fictional). The prices fluctuate based on market conditions (simulated in-game), and players aim to maximize their portfolios by making profitable trades. Real-time market changes should create tension, making the trading environment dynamic.

### Levels & Leaderboards: 
Players can start with a small amount of capital and try to grow their wealth over time. As they level up, they can unlock more stocks, access to advanced trading features, and higher-level strategies. There should be a leaderboard where players are ranked based on their level gained which is decided by amount of profit made/shares bought. The users experience gained from buying shares reduces dynamically from level increase.

### Market Events: 
Occasionally, the stock market is affected by random in-game events, like a "market crash," "global financial crisis," or "IPO hype," which shake things up and affect all players. These events are triggered randomly.

---

## Scalability Considerations

### Distributed Servers: 
There may be a need to scale the game server horizontally to handle a large number of concurrent players.

### Load Balancing: 
A load balancer could distribute requests across multiple game servers, ensuring that no single server becomes overwhelmed.

### Real-time Data Handling: 
Since stock trading is heavily reliant on real-time updates, consideration of optimization of WebSocket connections for low-latency communication.

---

## Security Considerations

### Secret Key Obfuscation:
Using .gitignore and environment varaiables to properly ensure the security of the services needed and mantain the web application.

### Password Hashing:
Performing a password hash when committing data the database - in this project I have used SHA256.

### JWT Authentication:
JWT's are stateless and self contained - being digitally signed with a hashing method such as SHA256. They can be verified with just the signature and public key, reducing server-side storage needs and reducing database load. 

---

## 📌 Development Phases

### Prototype:

Focus on developing the core mechanics (real-time stock trading, market events).

Implement the trading interface and core stock price simulation.

### Multiplayer Integration:

Set up a basic multiplayer framework using WebSockets (Socket.IO) to handle player interactions.

### Backend & Database Integration:

Set up a database to store player profiles, stock transactions, and market data.

### UI Design & Polishing:

Work on creating an intuitive and engaging user interface that includes charts, trade options, and player profiles.

### Testing & Launch:

Test for bugs, scalability, and balance. After the testing phase, release the game and ensure that the servers are optimized for a large number of concurrent players.

 ---

## 👥 User Stories

### 🧑 New Player
- As a new player, I want to register or join the game instantly so that I can start trading right away.
- As a new player, I want to receive a starting balance so I can participate in the market.

### 👤 Registered Player
- As a player, I want to view a list of available stocks and their current prices.
- As a player, I want to buy and sell stocks so I can grow my virtual portfolio.
- As a player, I want to see my balance and current holdings so I can make informed decisions.
- As a player, I want stock prices to update in real time so that the game feels dynamic.
- As a player, I want to view a leaderboard so I can compare my performance to others.

### 🧑‍🤝‍🧑 Multiplayer
- As a player, I want to see other players current stocks held on their profile.
- As a player, I want to see other players top three trades of all time.
- As a player, I want to be able to comment on other peoples profiles.

---

## Schema

### Entity Relationship Diagram

---

## Browser Testing

---

## Manual Testing

| **ID** | **Feature / User Story**  | **Test Description**                                                     | **Expected Result**                                          | **Test Type**           | **Status** |
| ------ | ------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------- | ---------- |
| T01    | User Registration         | New user can register with email and password                            | User account is created; JWT token returned                  | Functional / Auth       | ✅ Pass |
| T02    | User Login                | Registered user can log in                                               | JWT token is returned; access to user dashboard granted      | Functional / Auth       | ✅ Pass |
| T03    | Starting Balance          | New user receives starting virtual currency                              | Account shows initial balance (e.g., \$10,000 virtual money) | Unit                    | ✅ Pass |
| T04    | View Stock List           | Display available stocks and current prices                              | Stock list is visible and updates in real time               | Functional / UI         | ✅ Pass |
| T05    | Buy Stocks                | Player buys a stock from list                                            | Balance and holdings update correctly                        | Functional / Logic      | ✅ Pass |
| T06    | Sell Stocks               | Player sells owned stock                                                 | Holdings decrease, balance increases                         | Functional / Logic      | ✅ Pass |
| T07    | Portfolio Overview        | Player can view holdings, balance, and past trades                       | Portfolio reflects up-to-date info                           | Functional / UI         | ✅ Pass |
| T08    | Leaderboard               | Display player rankings by level                               | Leaderboard updates dynamically with correct rankings        | Integration / UI        | ✅ Pass|
| T09    | Stock Price Simulation    | Stock prices fluctuate over time                                         | Prices adjust based on internal algorithm                    | Simulation / Logic      | ✅ Pass|
| T10    | Market Events             | Trigger in-game events affecting prices (e.g., crash, hype)              | All players see market effects in real time                  | Event / Simulation      | ✅ Pass |
| T11    | Real-Time Updates         | Sync data across all clients via WebSockets                              | Players see trades, prices, and events update instantly      | WebSocket / Integration | ✅ Pass |
| T12    | JWT Authentication        | Access to secure routes requires valid token                             | Invalid token leads to 401 Unauthorized                      | Security / Auth         | ✅ Pass |
| T13    | Password Security         | Passwords stored using SHA256 hashing                                    | No plain-text passwords in database                          | Security                | ✅ Pass |
| T14    | Environment Configuration | Use environment variables for secrets and API keys                       | `.env` used; secrets not exposed in codebase                 | Security / Config       | ✅ Pass |
| T15    | API Integration           | Client successfully interacts with Django REST API via Node.js           | Data flows correctly between frontend and backend            | Integration / API       | ✅ Pass |
| T16    | Lighthouse Audit          | Run Lighthouse audit for performance, accessibility, best practices, SEO | Scores >90 in each core area                                 | Accessibility / UX      | ⬜️ Pending |
| T17    | Code Validation           | HTML, CSS, JS, and Python code pass standard validators                  | No critical W3C or linter errors                             | Code Quality            | ⬜️ Pending |
| T18    | Load Handling             | Application handles high volume of simultaneous users                    | No crashes; real-time sync remains consistent                | Performance / Load      | ⬜️ Pending |


---

## User Story Testing

### 🧑 New Player
- As a new player, I want to register or join the game instantly so that I can start trading right away.
- As a new player, I want to receive a starting balance so I can participate in the market.

### 👤 Registered Player
- As a player, I want to view a list of available stocks and their current prices.
- As a player, I want to buy and sell stocks so I can grow my virtual portfolio.
- As a player, I want to see my balance and current holdings so I can make informed decisions.
- As a player, I want stock prices to update in real time so that the game feels dynamic.
- As a player, I want to view a leaderboard so I can compare my performance to others.

### 🧑‍🤝‍🧑 Multiplayer
- As a player, I want to see other players current stocks held on their profile.
- As a player, I want to see other players top three trades of all time.
- As a player, I want to be able to comment on other peoples profiles.
- As a player, I want to join lobbies or private rooms for group trading competitions(future feature).

---

## Lighthouse Testing

---

## HTML/CSS/JS/Python Validators

---

## Dependencies

### Node.js Packages

- Express
- Socket.io

### Python Libraries

- Django
- Django Restframework
- Django Restframework SimpleJWT
- Django CORS Headers
- Psycopg2
- DJ Database

---

## 🚀 Getting Started

```bash
# 1. Clone the frontend repository
git clone https://github.com/ljkkj7/Milestone3Frontend

# 1.a Clone the backend repository
git clone https://github.com/ljkkj7/Milestone3

# 2. Install Node.js dependencies in the frontend
npm install

# 3. Install Python dependencies in the backend
pip install -r requirements.txt

# 4. Set up environment variables (create .env file)
# ENV=development
# Django will automatically setup a sqlite3 db for local host use

# 5. Navigate to backend Django app
cd backend/marketio_backend
venv/Scripts/activate

# 6. Run Django backend
python manage.py runserver

# 7. Run Node.js frontend server
node server.js

# 8. Visit http://localhost:3000 in your browser
```
