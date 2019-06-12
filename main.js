const {Blockchain, Transaction} = require('./blockchain.js');


const EC = require('elliptic').ec; // generate and check private and public keys
const ec = new EC('secp256k1'); // algorithm

const myKey = ec.keyFromPrivate('e93bb9602e3f055c7aad30b321116baae7dcc3948a3755337c5a3d1bb87944d3');
const myWalletAddress = myKey.getPublic('hex');


let testCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'pub-key-of-someone-else', 11);
tx1.signTransaction(myKey);
testCoin.addTransaction(tx1);

console.log('\n Staring the miner.');
testCoin.minePendingTransaction(myWalletAddress); // instead of sending them to another wallet send them to my wallet so we can accest it with public key
console.log('\n Balance for address is ', testCoin.getBalanceOfAddress(myWalletAddress)); // same in here
