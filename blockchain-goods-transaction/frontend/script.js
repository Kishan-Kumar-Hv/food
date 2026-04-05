const userMap = {
  ram: "0x5d533df67756bC464b222899E78D124426B69926",
  primepack: "0xB12b7c727402a090Dc9c62D1EB2D2aBF5C27Ca2c",
  john: "0x5d533df67756bC464b222899E78D124426B69926",
  rapidstore: "0xB12b7c727402a090Dc9c62D1EB2D2aBF5C27Ca2c"
};

async function syncPrimaryAddressEntries() {
  try {
    const res = await fetch('http://localhost:5000/api/accounts');
    const accounts = await res.json();

    if (Array.isArray(accounts) && accounts.length >= 2) {
      // Only refresh the first 2 primary mappings so the original name flow stays unchanged.
      userMap.ram = accounts[0];
      userMap.john = accounts[0];
      userMap.primepack = accounts[1];
      userMap.rapidstore = accounts[1];
    }
  } catch (err) {
    // Keep the existing fallback addresses if Ganache accounts are unavailable.
  }
}


document.getElementById('transactionForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  await syncPrimaryAddressEntries();

  const senderInputRaw = document.getElementById('sender').value.trim();
  const receiverInputRaw = document.getElementById('receiver').value.trim();

  const senderAddress = userMap[senderInputRaw.toLowerCase()];
  const receiverAddress = userMap[receiverInputRaw.toLowerCase()];

  if (!senderAddress || !receiverAddress) {
    alert("Invalid sender or receiver name");
    return;
  }

  const vehicle = document.getElementById('vehicle').value;
  const goods = document.getElementById('goods').value;
  const quantity = Number(document.getElementById('quantity').value);
  const transportCost = Number(document.getElementById('transportCost').value);

  const data = {
    sender: senderAddress,
    receiver: receiverAddress,
    vehicle,
    goods,
    quantity,
    transportCost
  };

  try {
    const res = await fetch('http://localhost:5000/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.error) {
      document.getElementById('output').innerHTML =
        `<p style="color:red;">${result.error}</p>`;
      return;
    }

    localStorage.setItem("pendingTransaction", JSON.stringify(data));
    localStorage.setItem("gasUsed", result.gasUsed);
    localStorage.setItem("balanceBefore", result.balanceBefore);
    localStorage.setItem("balanceAfter", result.balanceAfter);

    document.getElementById('output').innerHTML = `
      <h2 style="color:green;">Goods Sent Successfully</h2>
      <p>${senderInputRaw} → ${receiverInputRaw}</p>
    `;

  } catch (err) {
    document.getElementById('output').innerHTML =
      `<p style="color:red;">Transaction Failed</p>`;
  }
});


document.getElementById('paymentForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  await syncPrimaryAddressEntries();

  const payerRaw = document.getElementById('payer').value.trim().toLowerCase();
  const payeeRaw = document.getElementById('payee').value.trim().toLowerCase();

  const sender = userMap[payerRaw];
  const receiver = userMap[payeeRaw];

  if (!sender || !receiver) {
    alert("Invalid names");
    return;
  }

  const quantity = Number(document.getElementById('payQuantity').value);
  const pricePerUnit = Number(document.getElementById('pricePerUnit').value);
  const payment = quantity * pricePerUnit;

  const storedData = JSON.parse(localStorage.getItem("pendingTransaction"));

  if (!storedData) {
    alert("Send goods first!");
    return;
  }

  const gasUsed = Number(localStorage.getItem("gasUsed"));
  const balanceBefore = Number(localStorage.getItem("balanceBefore"));
  const balanceAfter = Number(localStorage.getItem("balanceAfter"));

  const data = {
    sender,
    receiver,
    quantity,
    payment,
    goods: storedData.goods,
    vehicle: storedData.vehicle,
    transportCost: storedData.transportCost,
    gasUsed,
    balanceBefore,
    balanceAfter
  };

  try {
    const res = await fetch('http://localhost:5000/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.error) {
      document.getElementById('output').innerHTML =
        `<p style="color:red;">${result.error}</p>`;
      return;
    }

    document.getElementById('output').innerHTML = `
      <h2 style="color:green;">Payment Successful</h2>
      <p>${payerRaw} → ${payeeRaw}</p>
      <p>Amount: ${payment}</p>
    `;

  } catch (err) {
    document.getElementById('output').innerHTML =
      `<p style="color:red;">Payment Failed</p>`;
  }
});
