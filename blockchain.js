const SHA256 = require('crypto-js/sha256');

const EC = require('elliptic').ec; // generate and check private and public keys
const ec = new EC('secp256k1'); // algorithm



class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }


    calculateHash() { // hash of the transaction that will be signed using the priv Key
        return SHA256(this.fromAddress+this.toAddress+this.amount).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }


        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx,'base64');
        this.signature = sig.toDER('hex'); // store signature into this transaction

    }

    isValid() { // check if our transaction has been correctly signed
        // miningRewards are transactions that are not signed
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction!');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash, this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    // Proof-of-Work/Mining
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty+1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        // the hash of a block won't change if we don't change the content - so what can we change in the block so that we can avoid infinite loop
        // we can add the nonce - random number that has nothing to do with your block usefull data
        console.log("Block mined: " + this.hash);
    }

    // verify all transactions in current vlock
    hasValidtransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}


class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 33; // 33 coins for succesfully mining a new block
    }

    createGenesisBlock() {
        return new Block("01/01/2017", "Genesis block", "0")
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    // addBlock(newBlock) {
    //     newBlock.previousHash = this.getLatestBlock().hash;

    //     // regenerate the hash
    //     // newBlock.hash = newBlock.calculateHash();
    //     newBlock.mineBlock(this.difficulty);

    //     this.chain.push(newBlock);
    // }
    minePendingTransaction(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions); // in reality mines need to pick the transactions that they want to use. here we use all transactions array
        block.mineBlock(this.difficulty);

        console.log('Block succeafully mined!');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    // createTransaction(transaction){
    //     this.pendingTransactions.push(transaction);
    // }
    addTransaction(transaction){

        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('trnasaction must include from and to address');
        }

        if (!transaction.isValid()){
            throw new Error('cannot add invalid transactions');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if(trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for(let i=1;i<this.chain.length;i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if (!currentBlock.hasValidtransactions()){ // invalid transaction state
                return false;
            }

            if (currentBlock.hash != currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash != previousBlock.hash) {
                return false;
            }
        }
    }

}


module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;