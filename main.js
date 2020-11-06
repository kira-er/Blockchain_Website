const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('1b6dd5fae6e37cf16a9fc305f0f62c8e55e7f7e765fc8bad4b7c9665c2c6e9b6');
const myWalletAddress = myKey.getPublic('hex');


let chain = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
chain.createTransaction(tx1);


console.log("Starting the miner...")
chain.minePendingTransaction(myWalletAddress);

console.log("Balance of miner: " + chain.getBalanceOfAddress(myWalletAddress));

console.log("Starting the miner...")
chain.minePendingTransaction("miner-address");

console.log("Balance of miner: " + chain.getBalanceOfAddress(myWalletAddress));
