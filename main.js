const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
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

    createTransaction(transaction){
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

            if (currentBlock.hash != currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash != previousBlock.hash) {
                return false;
            }
        }
    }






}

let testCoin = new Blockchain();

testCoin.createTransaction(new Transaction('addr1','addr2',100)); // addr1 and addr2 will be the public keys of someone's wallets
testCoin.createTransaction(new Transaction('addr2','addr1',50));
// at this state they will be pending so we need to start the miner
console.log('\n Staring the miner.');
testCoin.minePendingTransaction('another-address');

console.log('\n Balance for address is ', testCoin.getBalanceOfAddress('another-address'));
// you'll get the reward only when the next block is mined

console.log('\n Staring the miner. Again');
testCoin.minePendingTransaction('another-address');
console.log('\n Balance for address is ', testCoin.getBalanceOfAddress('another-address'));

