const Block = require('./Block');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block({
      sender: 'Genesis',
      receiver: 'Genesis',
      vehicle: 'None',
      goods: 'GenesisBlock',
      quantity: 0,
      transportCost: 0,
      paymentAmount: 0,
      gasUsed: 0,
      balanceBefore: 0,
      balanceAfter: 0
    }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlockData) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(newBlockData, previousBlock.currentHash);
    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const prev = this.chain[i - 1];
      if (current.currentHash !== current.calculateHash()) return false;
      if (current.previousHash !== prev.currentHash) return false;
    }
    return true;
  }
}

module.exports = new Blockchain();
