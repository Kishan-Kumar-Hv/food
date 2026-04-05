
---

🚀 Blockchain-Based Goods Transaction System

📌 Overview

This project is a Blockchain-Based Goods Transaction System that simulates secure and transparent transactions in a supply chain environment.

It allows users to:

- Send goods from sender → receiver
- Track transaction details
- Store transactions in blockchain
- Detect tampering using hash validation

---

🎯 Features

- 🔗 Blockchain-based transaction storage
- 🧾 Immutable data using hashing
- 🔍 Tampering detection mechanism
- 💰 Gas usage simulation (Ganache)
- 🗄️ MongoDB for persistent storage
- 🌐 Simple frontend dashboard

---

🏗️ Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Blockchain: Web3.js, Ganache
- Database: MongoDB

---

⚙️ How It Works

1. User enters:
   
   - Sender
   - Receiver
   - Goods
   - Quantity
   - Transport cost

2. System:
   
   - Maps names → blockchain addresses
   - Executes transaction using Ganache
   - Calculates gas usage
   - Creates a new block

3. Block contains:
   
   - Transaction data
   - Previous hash
   - Current hash
   - Timestamp

4. All blocks are:
   
   - Stored in MongoDB
   - Linked using hashes

---

🔐 Tampering Detection

- Blockchain is rebuilt from MongoDB
- Hashes are recalculated
- If mismatch occurs → system shows:

⚠️ Data Tampered!

---

🧪 Demo Flow

1. Perform a transaction → ✅ Success
2. Modify data in MongoDB → ❌ Tamper
3. Run transaction again → ⚠️ Data Tampered

---

▶️ Setup Instructions

1️⃣ Clone Repository

git clone
cd blockchain-goods-transaction

2️⃣ Install Dependencies

cd backend
npm install

3️⃣ Start Ganache

- Run Ganache locally
- Ensure RPC URL:

http://127.0.0.1:7545

4️⃣ Start Backend

node server.js

5️⃣ Start Frontend

- Open "index.html" in browser

---

💡 Example Transaction

Sender: Ram
Receiver: Warehouse
Goods: Potato
Quantity: 50
Transport Cost: 500

---

📊 Key Concept

- MongoDB: Stores data (modifiable)
- Blockchain: Ensures integrity (non-tamperable)

---

👩‍💻 Author

- Khushi Nanjesh

---
---
