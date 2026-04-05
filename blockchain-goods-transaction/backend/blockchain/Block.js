const computeHash = require('../utils/hashUtil');

class Block {
  constructor(data, previousHash = '') {
    this.sender = data.sender;
    this.receiver = data.receiver;
    this.vehicle = data.vehicle;
    this.goods = data.goods;
    this.quantity = data.quantity;
    this.transportCost = data.transportCost;
    this.paymentAmount = data.paymentAmount ?? data.payment ?? data.receivedPayment ?? 0;
    this.gasUsed = data.gasUsed;
    this.balanceBefore = data.balanceBefore;
    this.balanceAfter = data.balanceAfter;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.previousHash = previousHash;

    if (data.currentHash) {
      this.currentHash = data.currentHash;
    } else {
      this.currentHash = this.calculateHash();
    }
  }

  calculateHash() {
    const normalizedPaymentAmount = Number(this.paymentAmount);
    const paymentHashPart =
      Number.isFinite(normalizedPaymentAmount) && normalizedPaymentAmount > 0
        ? normalizedPaymentAmount
        : '';

    const rawData =
      this.sender +
      this.receiver +
      this.vehicle +
      this.goods +
      this.quantity +
      this.transportCost +
      paymentHashPart +
      this.gasUsed +
      this.balanceBefore +
      this.balanceAfter +
      this.timestamp +
      this.previousHash;

    return computeHash(rawData);
  }
}

module.exports = Block;
