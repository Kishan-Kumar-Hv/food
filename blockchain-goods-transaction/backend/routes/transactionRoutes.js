const express = require('express');
const router = express.Router();

const web3 = require('../web3Config');
const blockchain = require('../blockchain/Blockchain');
const BlockModel = require('../models/BlockModel');
const Block = require('../blockchain/Block');

router.get('/accounts', async (req, res) => {
  const accounts = await web3.eth.getAccounts();
  res.json(accounts);
});

async function storeBlock(blockData, newBlock) {
  await BlockModel.updateOne(
    { currentHash: newBlock.currentHash },
    {
      $set: {
        ...blockData,
        previousHash: newBlock.previousHash,
        currentHash: newBlock.currentHash,
        timestamp: newBlock.timestamp
      }
    },
    { upsert: true }
  );
}

async function rebuildBlockchainFromDb() {
  const blocksFromDB = await BlockModel.find().sort({ timestamp: 1 });

  blockchain.chain = blocksFromDB.map((block) => {
    return new Block(
      {
        sender: block.sender,
        receiver: block.receiver,
        vehicle: block.vehicle,
        goods: block.goods,
        quantity: block.quantity,
        transportCost: block.transportCost,
        paymentAmount: block.paymentAmount ?? block.receivedPayment ?? 0,
        gasUsed: block.gasUsed,
        balanceBefore: block.balanceBefore,
        balanceAfter: block.balanceAfter,
        timestamp: block.timestamp,
        currentHash: block.currentHash
      },
      block.previousHash
    );
  });
}

router.post('/transfer', async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    const accounts = await web3.eth.getAccounts();

    if (!accounts.includes(sender)) {
      return res.status(400).json({ error: 'Invalid sender address' });
    }

    if (!accounts.includes(receiver)) {
      return res.status(400).json({ error: 'Invalid receiver address' });
    }

    const balanceBeforeWei = await web3.eth.getBalance(sender);

    const tx = await web3.eth.sendTransaction({
      from: sender,
      to: receiver,
      value: '0',
      gas: 21000
    });

    const gasUsed = Number(tx.gasUsed);

    const balanceAfterWei = await web3.eth.getBalance(sender);

    const balanceBefore = web3.utils.fromWei(balanceBeforeWei.toString(), 'ether');
    const balanceAfter = web3.utils.fromWei(balanceAfterWei.toString(), 'ether');

    res.json({
      message: "Goods Sent Successfully",
      gasUsed,
      balanceBefore,
      balanceAfter
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/pay', async (req, res) => {
  try {
    const {
      sender,
      receiver,
      quantity,
      paymentAmount,
      payment,
      goods,
      vehicle,
      transportCost
    } = req.body;

    const accounts = await web3.eth.getAccounts();

    if (!accounts.includes(sender)) {
      return res.status(400).json({ error: 'Invalid sender' });
    }

    if (!accounts.includes(receiver)) {
      return res.status(400).json({ error: 'Invalid receiver' });
    }

    const normalizedPaymentAmount = Number(paymentAmount ?? payment);

    if (!Number.isFinite(normalizedPaymentAmount) || normalizedPaymentAmount < 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    // Rebuild from MongoDB before adding a new block so the next hash links correctly.
    await rebuildBlockchainFromDb();

    if (!blockchain.isChainValid()) {
      return res.status(400).json({ error: "Tampered!" });
    }

    // Payment is a separate ETH transfer from goods receiver -> goods sender.
    const paymentBalanceBeforeWei = await web3.eth.getBalance(sender);
    const paymentEthAmount = normalizedPaymentAmount / 1000;

    const paymentTx = await web3.eth.sendTransaction({
      from: sender,
      to: receiver,
      value: web3.utils.toWei(paymentEthAmount.toString(), 'ether'),
      gas: 21000
    });

    const paymentBalanceAfterWei = await web3.eth.getBalance(sender);

    const blockData = {
      // Store the original goods direction in the block.
      sender: receiver,
      receiver: sender,
      vehicle,
      goods,
      quantity: Number(quantity),
      transportCost: Number(transportCost),
      paymentAmount: normalizedPaymentAmount,
      receivedPayment: normalizedPaymentAmount,
      gasUsed: Number(paymentTx.gasUsed),
      balanceBefore: parseFloat(
        web3.utils.fromWei(paymentBalanceBeforeWei.toString(), 'ether')
      ),
      balanceAfter: parseFloat(
        web3.utils.fromWei(paymentBalanceAfterWei.toString(), 'ether')
      )
    };

    const newBlock = blockchain.addBlock(blockData);

    await storeBlock(blockData, newBlock);
    await rebuildBlockchainFromDb();

    if (!blockchain.isChainValid()) {
      return res.status(400).json({ error: "Tampered!" });
    }

    res.json({ message: "Payment Success" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
