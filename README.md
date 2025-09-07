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

## 🎮 Game Design

### Trading Mechanics

Players begin with $1000 virtual currency and can:

- Purchase stocks at current market prices
- Sell holdings for profit or loss
- View real-time portfolio performance
- Track transaction history

### Progression System

- Experience Points: Earned through trading activity
- Levels: Progressive unlocks based on XP accumulation
- Leaderboards: Rankings by level and trading performance

### Market Simulation

The price engine uses a hybrid approach:

- Base Sine Wave: Provides predictable price cycling
- Random Noise: Adds realistic volatility
- Market Events: Triggers system-wide price movements

## 🖥️ User Interface

### Page Structure

#### Landing Page (/)

- Game introduction and features overview
- Registration/login access points

#### Dashboard (/dashboard)

- Detailed stock view for players portfolio
- Individual stock analyitcs

#### Market View (/market)

- Complete stock listings with real-time prices
- Market charts

#### Stock Detail (/stock/:symbol)

- Individual stock information page
- Trading interface

#### Leaderboards (/leaderboard)

- Player rankings

#### Profile Pages (/profile/:username)

- Player statistics
- Holdings and performance metrics
- Top trades showcase
- Community comments section

## 🔒 Security & Authentication

### Authentication Flow

- Registration: Email/username validation with secure password requirements
- Login: JWT token generation with expiration handling
- Authorization: Route protection and role-based access
- Session Management: Automatic token refresh and logout

### Security Measures

- Password Security: SHA256 hashing
- JWT Implementation: Stateless authentication with signature verification
- Environment Variables: Secret keys and database credentials protection
- CORS Configuration: Cross-origin request filtering
- Input Validation: SQL injection and XSS prevention

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

## Challenges of Implementing a Real-Time Simulated Stock Market Using a Sine Wave Algorithm
Designing a real-time stock market simulation using a sine wave algorithm to dictate price fluctuations may seem appealing due to its predictable, smooth oscillation, but it introduces several technical and gameplay-related difficulties:

### 1. Predictability

A sine wave follows a mathematically predictable pattern, making it possible for players to "time the market" and game the system by predicting when prices will rise or fall.

Consequence: This undermines the challenge and realism of trading. It turns the game into a pattern-recognition task rather than strategic decision-making under uncertainty.

### 2. Lack of Realism

Real-world stock markets are influenced by complex, often random variables: news events, earnings reports, political shifts, etc. A sine wave provides perfect symmetry and rhythm, which feels artificial.

Consequence: Players may find the market behavior too mechanical, hurting immersion and replayability.

### 3. Synchronization Complexity
In a multiplayer environment using WebSockets, synchronizing sine wave-driven prices across all clients requires precise time coordination. Even small desynchronizations between client clocks and server ticks can lead to price discrepancies.

Consequence: Real-time trading could break if users are acting on slightly different price data, leading to fairness issues and bugs.

### 4. Difficulty Simulating Volatility and News Events
A sine wave has a constant frequency and amplitude unless artificially modified. Introducing realistic volatility spikes, crashes, or news-induced market shifts requires layering additional noise or event triggers on top of the wave.

Consequence: This increases complexity and may require building a custom hybrid algorithm that blends deterministic and random behavior.

### 5. Inflexibility in Scaling Complexity
As the game gets more complex, there is a need to simulate different sectors or stocks reacting independently. A basic sine wave doesn’t account for correlation between stocks, volume pressure, or divergent market behavior.

Consequence: Using sine waves can limit future development of advanced trading mechanics and nuanced market conditions.

### 6. Server Performance Load
Continuously calculating and broadcasting stock prices in real time (especially for many assets using sine functions + noise) can become CPU-intensive, particularly under high player load.

Consequence: Without efficient computation and throttling strategies, it can impact backend performance and increase latency.

### ✔️ Potential Solutions
To mitigate the above issues:

Combine sine waves with random noise and event-based modifiers to introduce unpredictability.

Use server-side timestamping to maintain synchronized price states across clients.

Periodically regenerate parameters (e.g., amplitude, frequency) to make cycles less predictable.

Layer in game-driven events to break regularity.

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

[Entity Relationship Diagram](public/assets/images/entityrelationshipdiagram.png)

### Data Modelling

#### 1. auth_user
This table stores core authentication data for all users of the application.

```
id (int): Primary key, unique identifier for each user.

password (varchar): Hashed password for secure authentication.

is_superuser (boolean): Indicates if the user has all permissions.

username (varchar): Unique username used for login.

is_staff (boolean): Determines if the user has admin site access.

is_active (boolean): Specifies whether the user account is active.

date_joined (timestamptz): Timestamp of account creation.
```

#### 2. custom_auth_userprofile
This table extends the base user model with game-specific and financial data.

```
user_id (int): Foreign key linking to auth_user.id, primary key here as well (one-to-one).

balance (decimal): Current in-game currency or funds the user holds.

experience (int): XP points reflecting user progress or trading activity.

level (int): Gamified user level, likely derived from experience.
```

#### 3. stockhandler_stock
This table represents individual stocks available in the simulation.

```
id (bigint): Primary key for each stock.

symbol (varchar): Ticker symbol (e.g., AAPL, TSLA).

name (varchar): Full name of the company/stock.

price (decimal): Current live price of the stock.

base_price (decimal): Initial or baseline price used in price simulation.

amplitude (decimal): Represents the sine wave amplitude used in price simulation.

noise (decimal): Randomized noise added to the stock price to simulate volatility.

status (varchar): Indicates whether the stock is active, paused, or delisted.

created_at (timestamptz): Timestamp of when the stock was added.
```

#### 4. stockhandler_transaction
Tracks every buy or sell transaction carried out by users.

```
id (bigint): Primary key for the transaction.

quantity (int): Number of shares bought or sold.

price (decimal): Price per share at the time of transaction.

transaction_type (varchar): Either 'buy' or 'sell'.

stock (bigint): Foreign key to stockhandler_stock.id, identifying which stock is transacted.

user_profile_id (int): Foreign key to custom_auth_userprofile.user_id, identifying who made the transaction.
```

#### 5. comments_comment
Handles user comments, typically for social interaction or feedback.

```
id (bigint): Primary key of the comment.

content (text): Actual text content of the comment.

created_at (timestamptz): Timestamp of comment creation.

updated_at (timestamptz): Timestamp of the last update to the comment.

author_id (int): Foreign key to auth_user.id, indicates who wrote the comment.

target_user_id (int): Foreign key to auth_user.id, the user to whom the comment is directed (e.g., profile comments).
```

---

## Wireframes

### Index

### Market

### Dashboard

### Stock Detail

### Leaderboard

### Profile

---

## Browser Testing

Browser Compatibility
Tested across major browsers:

✅ Chrome (v120+)
✅ Firefox (v115+)
✅ Safari (v16+)
✅ Edge (v120+)

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
| T16    | Lighthouse Audit          | Run Lighthouse audit for performance, accessibility, best practices, SEO | Scores >90 in each core area                                 | Accessibility / UX      | ✅ Pass |
| T17    | Code Validation           | HTML, CSS, JS, and Python code pass standard validators                  | No critical W3C or linter errors                             | Code Quality            | ⬜️ Pending |


---

## User Story Testing

| **ID**    | **User Story**                     | **Test Description**                                     | **Expected Result**                                              | **Test Type**          | **Status** |
| --------- | ---------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------- | ---------- |
| **UST01** | New user registers                 | Test registration form and submit with valid credentials | Account is created, JWT returned, redirected to dashboard        | Functional / Auth      | ✅ Pass     |
| **UST02** | New user receives starting balance | After registration, check wallet balance                 | Wallet displays \$1000 virtual funds                           | Unit / UI              | ✅ Pass     |
| **UST03** | View stock list                    | Player lands on dashboard and sees updated stock prices  | Real-time stock table is populated and changes every few seconds | UI / WebSocket         | ✅ Pass     |
| **UST04** | Buy stock                          | User selects a stock, enters quantity, and clicks “Buy”  | Virtual balance decreases, holdings increase, trade logged       | Functional             | ✅ Pass     |
| **UST05** | Sell stock                         | User sells a stock from portfolio                        | Balance increases, stock quantity reduces in holdings            | Functional             | ✅ Pass     |
| **UST06** | See portfolio                      | Navigate to “Dashboard”                               | Holdings & balance appear accurately           | UI                     | ✅ Pass     |
| **UST07** | Live stock updates                 | Stock prices fluctuate automatically                     | Stock list reflects real-time simulated pricing                  | Simulation / WebSocket | ✅ Pass     |
| **UST08** | Leaderboard view                   | Click "Leaderboard" from nav menu                        | Leaderboard appears sorted by player level                       | UI                     | ✅ Pass     |
| **UST09** | View other profiles                | Click on another user from leaderboard                   | Public profile loads showing current holdings and top 3 trades   | Functional             | ✅ Pass     |
| **UST10** | Comment on profile                 | Write a comment on another user's profile page           | Comment is submitted and displayed in real-time                  | Functional / WebSocket | ✅ Pass     |
| **UST11** | Trigger market event               | Simulate event like “Crash”                              | All stock prices react according to logic, reflected live        | Simulation / Event     | ✅ Pass     |
| **UST12** | Unauthorized access                | Try to access dashboard without JWT                      | Redirected to login or shown 401 error                           | Security / Auth        | ✅ Pass     |

#### Images

- [UST01](./public/assets/images/registeruserstory.jpg)
- [UST02 - Initial Login](./public/assets/images/loginuserstory.jpg)
- [UST02 - Balance Update](./public/assets/images/loginbalanceuserstory.jpg)
- [UST03](./public/assets/images/dashboarduserstory.jpg)
- [UST04 - Initial Buy](./public/assets/images/stockbuyuserstory.jpg)
- [UST04 - Buy Effect](./public/assets/images/stockbuyafteruserstory.jpg)
- [UST05 - Initial Sell](./public/assets/images/stockselluserstory.jpg)
- [UST05 - Sell Effect](./public/assets/images/stocksellafteruserstory.jpg)
- [UST06](./public/assets/images/dashboarduserstoryholdings.jpg)
- [UST07](./public/assets/images/dashboarduserstory.jpg)
- [UST08](./public/assets/images/leaderboarduserstory.jpg)
- [UST09](./public/assets/images/profileuserstory.jpg)
- [UST10 - Comment Write](./public/assets/images/commentuserstory.jpg)
- [UST10 - Comment Post](./public/assets/images/commentafteruserstory.jpg)
- [UST11 - Event Trigger](./public/assets/images/stockeventuserstory.jpg)
- [UST11 - Event Effect](./public/assets/images/stockeventafteruserstory.jpg)
- [UST12](./public/assets/images/unauthuserstory.jpg)

---

## Lighthouse Testing

| **ID** | **Page**       | **Test Type**  | **Metric**                | **Expected Score** | **Status** |
| ------ | -------------- | -------------- | ------------------------- | ------------------ | ---------- |
| LH01   | `index`        | Performance    | Load Speed                | ≥ 70               | ✅ Pass  |
| LH02   | `index`        | Accessibility  | ARIA, Color Contrast      | ≥ 80               | ✅ Pass  |
| LH03   | `index`        | Best Practices | Code Quality              | ≥ 80               | ✅ Pass  |
| LH04   | `index`        | SEO            | Meta Tags, Link Titles    | ≥ 80               | ✅ Pass  |
| LH05   | `dashboard`    | Performance    | Time to Interactive       | ≥ 80               | ✅ Pass  |
| LH06   | `dashboard`    | Accessibility  | Keyboard Navigation       | ≥ 80               | ✅ Pass  |
| LH07   | `dashboard`    | SEO            | Structure, Heading Levels | ≥ 80               | ✅ Pass  |
| LH08   | `leaderboard`  | Performance    | Speed Index               | ≥ 80               | ✅ Pass  |
| LH09   | `leaderboard`  | Accessibility  | ARIA and Labels           | ≥ 80               | ✅ Pass  |
| LH10   | `market`       | Performance    | First Contentful Paint    | ≥ 80               | ✅ Pass  |
| LH11   | `market`       | Accessibility  | Chart Navigation          | ≥ 80               | ✅ Pass  |
| LH12   | `profile`      | Performance  | Form Labels, Comments     | ≥ 70               | ✅ Pass  |
| LH13   | `profile`      | Accessibility  | Form Labels, Comments     | ≥ 80               | ✅ Pass  |
| LH14   | `profile`      | SEO            | Mobile Optimization       | ≥ 80               | ✅ Pass  |
| LH15   | `stock-detail` | Performance    | JS Execution Time         | ≥ 80               | ✅ Pass  |
| LH16   | `stock-detail` | SEO            | Page Title, Meta Tags     | ≥ 80               | ✅ Pass  |

#### Images

- [Index Lighthouse Report](./public/assets/images/indexlighthouse.jpg)
- [Dashboard Lighthouse Report](./public/assets/images/dashboardlighthouse.jpg)
- [Leaderboard Lighthouse Report](./public/assets/images/leaderboardlighthouse.jpg)
- [Market Lighthouse Report](./public/assets/images/marketlighthouse.jpg)
- [Profile Lighthouse Report](./public/assets/images/profilelighthouse.jpg)
- [Stock Detail Lighthouse Report](./public/assets/images/stockdetaillighthouse.jpg)

---

## HTML/CSS/JS/Python Validators

| **ID** | **File Type** | **File(s)**                       | **Validation Tool** | **Test Description**                                 | **Expected Result**                 | **Status** |
| ------ | ------------- | --------------------------------- | ------------------- | ---------------------------------------------------- | ----------------------------------- | ---------- |
| V01    | HTML          | All `.html` files                 | W3C HTML Validator  | Check for HTML5 syntax and structure issues          | No critical validation errors       | ⬜ Pending  |
| V02    | CSS           | All `.css` files                  | W3C CSS Validator   | Validate CSS syntax and property usage               | No errors, valid CSS styles         | ⬜ Pending  |
| V03    | JavaScript    | All `.js` frontend files          | ESLint              | Check for JS syntax errors and best practices        | No major linting or logic issues    | ⬜ Pending  |
| V04    | JavaScript    | WebSocket interaction scripts     | ESLint              | Ensure WebSocket logic follows conventions           | Clean linting report                | ⬜ Pending  |
| V05    | Python        | All Django backend files          | Flake8              | Check for Python PEP8 compliance                     | Score ≥ 8.0 or minimal style issues | ⬜ Pending  |
| V06    | Python        | Django REST API views/serializers | Flake8              | Validate correct usage of serializers and views      | No critical warnings                | ⬜ Pending  |
| V07    | Python        | Authentication (JWT-related) code | Flake8              | Ensure secure and proper JWT implementation          | No security issues or bad practices | ⬜ Pending  |
| V08    | HTML + JS     | Chart rendering and DOM scripts   | W3C + ESLint        | Validate chart rendering functions and accessibility | Well-structured, accessible code    | ⬜ Pending  |

### Images

- [Dummy Links]()
- [Dummy Links]()
- [Dummy Links]()
- [Dummy Links]()
- [Dummy Links]()
- [Dummy Links]()
- [Dummy Links]()
- [Dummy Links]()
- [Dummy Links]()

---

### Postman API Tests

---

### Bugs & Errors

---

## Technologies Used

### Languages

- Python
- CSS3
- HTML5
- JavaScript

### Runtime environment

- Node.js

### Databases

- PostgreSQL
- DB.SQLITE3

### Dependencies

#### Packages & Libraries

- Express
- Socket.io
- Chart.js
- Django
- Django Restframework
- Django Restframework SimpleJWT
- Django CORS Headers
- Psycopg2
- DJ Database
- gunicorn
- pip

### Programmes & Applications

- DrawSQL
- Git
- GitHub
- GitHub Projects
- Chrome DevTools
- Postman

### Hosting

- Heroku 

---

## 🚀 Getting Started

You can try the app instantly on the live deployment:

🔗 **[Launch Market.io on Heroku](https://marketio-frontend-139f7c2c9279.herokuapp.com)**

Or follow the steps below to run it locally.


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

## Credits

- Stack Overflow
- W3 Schools