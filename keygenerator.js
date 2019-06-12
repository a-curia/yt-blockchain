const EC = require('elliptic').ec; // generate and check private and public keys
const ec = new EC('secp256k1'); // algorithm

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log();
console.log('Private key: ',privateKey);


console.log();
console.log('Public key: ',publicKey);

// used to sign transactions and get your ballance - identifies you