const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const transactionRoutes = require('./routes/transactionRoutes');
require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api', transactionRoutes);

const BlockModel = require('./models/BlockModel');
const blockchain = require('./blockchain/Blockchain');

async function storeGenesis() {
  const count = await BlockModel.countDocuments();

  if (count === 0) {
    const genesis = blockchain.chain[0];

    await BlockModel.updateOne(
      { currentHash: genesis.currentHash },
      {
        $set: {
      sender: genesis.sender,
      receiver: genesis.receiver,
      vehicle: genesis.vehicle,
      goods: genesis.goods,
      quantity: genesis.quantity,
      transportCost: genesis.transportCost,
      paymentAmount: genesis.paymentAmount,
      gasUsed: genesis.gasUsed,
      balanceBefore: genesis.balanceBefore,
      balanceAfter: genesis.balanceAfter,
      previousHash: genesis.previousHash,
      currentHash: genesis.currentHash,
      timestamp: genesis.timestamp
        }
      },
      { upsert: true }
    );

    console.log("Genesis block stored in DB");
  }
}

storeGenesis().catch((err) => console.log(err.message));

app.get('/', (req, res) => {
  res.send('Blockchain Goods Transaction System Backend is running...');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
