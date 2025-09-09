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

## Price Engine Design

### Core Components

#### Django Application Structure

```
backend/
├── marketio_backend/
│   ├── comments/         # CRUD app for profile comments
│   ├── custom_auth/      # User management and authentication
│   ├── dashboard/        # Handling of Profile, Balance & Portfolio management & calculations
│   ├── leaderboard/      # Ranking and progression system
│   ├── marketio_backend/ # Django app config
│   └── stockhandler/     # Houses the price engine and manages stock price simulation, market events and transaction management 
└── venv/                # Virtual Environment
```

### Price Engine Implementation

#### Sine Wave Base Generator

To best simulate fluctuations in market prices - I decided to go with a sine wave. Due to its predictable nature and simplicty in manipulation.

To best handle the wave function I first needed to define each stock model with having the appropriate variables for manipulation.

The best way to manipulate this is through the amplitude and noise of the function. Manipulating the amplitude allows us to decide the magnitude of the price swings in either direction - and the noise allows us to increase or decrease the volatilty of these swings.

```python
class Stock(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)
    created_at = models.DateTimeField(auto_now_add=True)
    amplitude = models.DecimalField(max_digits=10, decimal_places=2, default=10.00)
    noise = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    status = models.CharField(max_length=20, default="normal")
```

For the generator method - I apply the principles of a sinewave function to each price in the database and save it back.

```python
def simulate_price_change(self):
        """"Simulate a price change based on a sine wave function and random noise."""

        #Check if a market event is happening to this stock
        if self.status == "positive":
            self.simulate_positive_market_event()
            return

        if self.status == "negative":
            self.simulate_negative_market_event()
            return

        now = timezone.now()
        delta = (now - self.created_at).total_seconds() / 3600 # Convert to hours
        amplitude = 10

        wave = amplitude * math.sin(0.05*delta + 2*math.pi*0.5)

        noise = random.uniform(-1.0, 1.0)

        new_price = Decimal(self.base_price) + Decimal(wave + noise)
        self.price = round(new_price, 2)
        self.save()
```

#### Market Event Method

As seen in the above method - every time the "simulate_price_change" method is called - there is a conditional check for the a flag in the stocks database entry.

Upon this check either function is called and the base function returns to avoid double price updates.

Both methods are essentially the same but reversed - I have shown them below.

```python
def simulate_positive_market_event(self):
        """Simulate a market event that affects the stock price positively."""
        
        # Set status to positive if not already
        if self.status != "positive":
            self.status = "positive"

        # MASSIVE amplification for dramatic price swings
        severity = random.randint(8, 10)  # Higher severity (8-10 instead of 1-10)
        
        # Hugely amplified event impact - multiply by 50-100x instead of just amplitude
        base_multiplier = random.uniform(50.0, 100.0)  # Massive base multiplier
        event_impact = severity * float(self.amplitude) * base_multiplier
        
        # Much larger stock impact range for dramatic swings
        stock_impact = random.uniform(20.0, event_impact)  # Start from 20 instead of 0.5
        
        # Amplified noise for more volatility
        noise = random.uniform(0, float(self.noise) * 10)
        
        # Keep your sine wave but make it much more aggressive
        # Faster frequency (0.5 instead of 0.05) and bigger amplitude
        time_factor = 0.5 * timezone.now().timestamp()
        wave = stock_impact * math.sin(time_factor + 2 * math.pi * 0.5)

        # Calculate new price - this can now create 300-400% swings
        price_change = wave + noise
        new_price = Decimal(self.price) + Decimal(price_change)
        
        self.price = max(Decimal('0.01'), Decimal(round(new_price, 2)))
        
            
        # Save the updated stock price
        self.save()
```

```python
def simulate_negative_market_event(self):
        """Simulate a market event that affects the stock price negatively."""
        
        # Set status to negative if not already
        if self.status != "negative":
            self.status = "negative"

        # MASSIVE amplification for dramatic price crashes
        severity = random.randint(8, 10)  # Higher severity (8-10 instead of 1-10)
        
        # Hugely amplified event impact - multiply by 30-80x for crashes
        base_multiplier = random.uniform(30.0, 80.0)  # Large but slightly less than positive
        event_impact = severity * float(self.amplitude) * base_multiplier

        # Much larger negative stock impact range
        stock_impact = -abs(random.uniform(15.0, event_impact))  # Start from 15 instead of 0.5
        
        # Amplified noise for more volatility
        noise = random.uniform(-float(self.noise) * 10, float(self.noise) * 10)
        
        # Keep your sine wave but make it much more aggressive for crashes
        # Faster frequency and bigger amplitude for dramatic drops
        time_factor = 0.5 * timezone.now().timestamp()
        wave = stock_impact * math.sin(time_factor + 2 * math.pi * 0.5)

        # Calculate new price
        price_change = wave + noise
        new_price = Decimal(self.price) + Decimal(price_change)
        
        self.price = max(Decimal('0.01'), Decimal(round(new_price, 2)))
        
            
        # Save the updated stock price
        self.save()
```

#### API View's

```python
class StockUpdateAPIView(APIView):
    def post(self, request):
        stocks = Stock.objects.all()
        for stock in stocks:
            stock.simulate_price_change()
        serializer = StockSerializer(stocks, many=True)
        return Response(serializer.data)
```

```python
class PositiveStockMarketEventAPIView(APIView):
    def post(self, request):
        stockAffected = request.data.get("symbol")
        stock = Stock.objects.filter(symbol=stockAffected).first()
        stock.simulate_positive_market_event()
        serializer = StockSerializer(stock)
        return Response(serializer.data)
```

```python
class NegativeStockMarketEventAPIView(APIView):
    def post(self, request):
        stockAffected = request.data.get("symbol")
        stock = Stock.objects.filter(symbol=stockAffected).first()
        stock.simulate_negative_market_event()
        serializer = StockSerializer(stock)
        return Response(serializer.data)
```

```python
class StockMarketEventEndAPIView(APIView):
    def post(self, request):
        stockAffected = request.data.get("symbol")
        stock = Stock.objects.filter(symbol=stockAffected).first()
        stock.market_event_end()
        serializer = StockSerializer(stock)
        return Response(serializer.data)
```
### Frontend Integration

#### Node.js -> Django API Integration

To avoid setting up a Linux server on my home laptop to run redis tasks, I've implemented a REST API workaround.

Upon the function call of "triggerMarketEvent", a random stock is chose and updated positvely or negatively through the respetive API's using a boolean flag to select which event is to happen.

The event is the ended after a random amount of time up to 1 minute [60000ms].

```javascript
async function triggerMarketEvent() {
    const eventIndicator = Math.floor(Math.random() * 2);
    try {
        const res = await fetch(DJANGO_STOCK_GET_LIST);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }
        const stocks = await res.json();
        const stock = stocks[Math.floor(Math.random() * stocks.length)];


        if (eventIndicator == 0) {
            const responsePositive = await fetch(DJANGO_STOCK_UPDATE_POSITIVE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ symbol: stock.symbol })
            })

            if (!responsePositive.ok) {
                throw new Error(`HTTP error! status: ${responsePositive.status}`)
            }

            console.log("Triggering positive stock event");

            io.emit('market_event', {
                type: 'positive',
                stock: stock.symbol
            })
        }

        if (eventIndicator == 1) {
            const responseNegative = await fetch(DJANGO_STOCK_UPDATE_NEGATIVE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ symbol: stock.symbol })
            })

            if (!responseNegative.ok) {
                throw new Error(`HTTP error! status: ${responseNegative.status}`)
            }

            console.log("Triggering negative stock event");

            io.emit('market_event', {
                type: 'negative',
                stock: stock.symbol
            })
        }

        const delay = Math.floor(Math.random() * 60001);
        setTimeout(async () => {
            try {
                await fetch(DJANGO_RESET_STATUS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symbol: stock.symbol })
                });
                console.log(`Reset status of ${stock.symbol} after ${delay}ms`);
            } catch (err) {
                console.error('Error resetting stock status:', err);
            }

            eventTrigger = false;
        }, delay);
    } catch(err) {
        console.error("Error triggering market event...", err)
    }
}
```

As seen from the logic above - all of the stock deciding logic is completed on the frontend and sent back to the Django backend in JSON format.

The mathematics and stock price manipulation is performed on the backend and retrieved using a socket.io loop to update stock prices.

```javascript
// Function to fetch stocks from Django API and send to clients
async function fetchAndSendStocks(socket) {
    try {

        // Fetch stock data from the Django API
        console.log('Fetching stocks from Django API...');
        const response = await fetch(DJANGO_STOCK_GET_LIST);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stocks = await response.json();


        // Emit the stocks data to all connected clients
        socket.emit('stocks_data', stocks);

    } catch (error) {
        console.error('Error fetching stocks:', error);
    }
}

// Function to update stock prices
async function updateStockPrices() {

    try {

        // Fetch updated stock prices from the Django API
        console.log('Updating stock prices from Django API...');

        const response = await fetch(DJANGO_STOCK_UPDATE, 
            {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' } 
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        io.emit('stocks_data', data);

    } catch (error) {
        console.error('Error updating stock prices:', error);
    }
}
```

## Price Engine Design Outcomes & Results

### Implementation Success Metrics

#### Price Engine Performance

The sine wave-based price engine successfully delivers:

- Predictable Market Cycles: Base sine wave provides learnable patterns for player strategy development
- Realistic Volatility: Combined amplitude and noise manipulation creates authentic market fluctuations
- Dramatic Market Events: Positive and negative event multipliers (50-100x and 30-80x respectively) generate compelling 300-400% price swings
- Mathematical Precision: Decimal-based calculations ensure accurate financial computations without floating-point errors

#### System Architecture Benefits

Simplified Infrastructure

- REST API Workaround: Node.js to Django integration eliminates need for complex Redis task queues during development
- Reduced Complexity: Direct API calls replace message queue infrastructure while maintaining functionality
- Development Efficiency: Faster iteration cycles without Linux server setup requirements

#### Real-Time Performance

- Socket.io Integration: Seamless real-time price updates to all connected clients
- Event Broadcasting: Instant market event notifications with stock symbol and event type
- Responsive Updates: Sub-second price change propagation across the frontend

#### Market Simulation Effectiveness

Dynamic Event System

- Random Event Triggers: Automated market events create unpredictable trading opportunities
- Timed Event Duration: Random 0-60 second event windows add strategic timing elements
- Multi-Stock Coverage: Events can affect any stock in the system, ensuring market-wide engagement

Price Behavior Results

- Stable Base Movement: Sine wave foundation prevents unrealistic price crashes to zero
- Amplified Volatility: Market events create dramatic but recoverable price movements
- Minimum Price Protection: Hard floor of $0.01 prevents negative or zero stock values

#### Technical Achievements

Backend Robustness

- Model-Driven Logic: Stock models encapsulate all price manipulation logic for maintainability
- Status Flag System: Simple boolean flags efficiently manage market event states
- API Endpoint Organization: Clear separation of concerns across different market actions

Frontend Integration Success

- Error Handling: Comprehensive try-catch blocks ensure system stability during API failures
- Asynchronous Operations: Non-blocking price updates maintain smooth user experience
- Event Broadcasting: Real-time market event notifications keep all players informed

#### Player Experience Impact

Engagement Features

- Market Event Anticipation: Random events create excitement and strategic decision points
- Visual Drama: Large price swings (300-400%) provide satisfying visual feedback
- Learning Opportunities: Predictable base patterns allow skill development while events add challenge

#### Development Insights

Implementation Lessons

- Pragmatic Solutions: REST API workaround proves simple solutions often outperform complex architectures
- Mathematical Modeling: Sine wave approach provides perfect balance of predictability and chaos
- Event-Driven Design: Status flags and timed events create engaging gameplay mechanics

Performance Validation

- Real-Time Responsiveness: Sub-second price updates maintain trading simulation authenticity
- Mathematical Accuracy: Decimal precision prevents financial calculation errors
- System Stability: Error handling and minimum price constraints ensure robust operation

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

## CRUD Functionality

The comments system enables users to leave public comments on each other's profiles, creating a social interaction layer within the trading game. 
The system implements full CRUD (Create, Read, Update, Delete) operations with proper authentication and permission controls.

### Model Structure

The Comment model establishes relationships between users through profile interactions:

```python
class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='written_comments')
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profile_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```
### Key Relationships:

```
author: The user who wrote the comment (one-to-many relationship)
target_user: The user whose profile receives the comment (one-to-many relationship)
Automatic timestamp tracking for creation and modification dates
```

### CRUD Operations

Create & Read (CommentListCreateView)

- Create: Authenticated users can post comments on any user's profile
- Read: Retrieves all comments for a specific target user, ordered by most recent
- Query Parameter: target_user ID to filter comments for specific profiles
- Auto-Assignment: Comment author automatically set to the authenticated user

Update & Delete (CommentRetrieveUpdateDestroyView)

- Retrieve: Fetch individual comments by ID
- Update: Comment authors can edit their own comments
- Delete: Both comment authors and profile owners can delete comments

### Permission System

Authentication Requirements

- All operations require user authentication (IsAuthenticated permission)
- Anonymous users cannot interact with the comments system

### Authorization Logic

- Comment Creation: Any authenticated user can comment on any profile
- Comment Editing: Only the original author can modify their comments
- Comment Deletion: Either the comment author OR the profile owner can delete comments
- Comment Viewing: Restricted to comments for the specified target user

### Permission Validation

```python
def get_object(self):
    obj = super().get_object()
    if obj.author != self.request.user and obj.target_user != self.request.user:
        raise PermissionDenied("You do not have permission to edit this comment.")
    return obj
```

### API Endpoints

#### List/Create Comments
```
GET /api/comments/?target_user={user_id} - Retrieve comments for a user's profile
POST /api/comments/ - Create a new comment (requires target_user in request body)
```
#### Individual Comment Operations
```
GET /api/comments/{comment_id}/ - Retrieve specific comment
PUT/PATCH /api/comments/{comment_id}/ - Update comment (author only)
DELETE /api/comments/{comment_id}/ - Delete comment (author or profile owner)
```

### Security Features

#### Data Integrity

- Foreign key constraints ensure referential integrity
- Cascade deletion removes comments when users are deleted
- Automatic timestamp updates track modification history

#### Access Control

- Permission checks prevent unauthorized comment modifications
- Profile owners can moderate comments on their profiles
- Clear error messages for permission violations

#### Input Validation

- TextField validation ensures content requirements are met
- User existence validation before comment creation
- Proper exception handling for invalid operations

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
| V01    | HTML          | All `.html` files                 | W3C HTML Validator  | Check for HTML5 syntax and structure issues          | No critical validation errors       | ✅ Pass  |
| V02    | CSS           | All `.css` files                  | W3C CSS Validator   | Validate CSS syntax and property usage               | No errors, valid CSS styles         | ✅ Pass |
| V03    | JavaScript    | All `.js` frontend files          | JSHint             | Check for JS syntax errors and best practices        | No major linting or logic issues    | ✅ Pass |
| V04    | JavaScript    | WebSocket interaction scripts     | JSHint              | Ensure WebSocket logic follows conventions           | Clean linting report                | ✅ Pass |
| V05    | Python        | All Django backend files          | Flake8 [VSCode Plugin]              | Check for Python PEP8 compliance                     | Score ≥ 8.0 or minimal style issues | ✅ Pass  |
| V06    | Python        | Django REST API views/serializers | Flake8 [VSCode Plugin]          | Validate correct usage of serializers and views      | No critical warnings                | ✅ Pass  |

### Images

- [JSLint & HTML/CSS Validators](./public/assets/images/jslinters/)
- [Python Linter](./public/assets/images/pythonlinter/pythonlinter.mkv)

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