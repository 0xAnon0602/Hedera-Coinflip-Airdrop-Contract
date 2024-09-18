const {
    Client,
    PrivateKey,
    AccountId,
    Hbar,
    TransferTransaction,
    ContractExecuteTransaction,
    ContractFunctionParameters
} = require("@hashgraph/sdk");
require("dotenv").config();
const config = require('../config.json')
const fs = require('fs');

function chunkArray(array, n) {
    if (!Array.isArray(array) || typeof n !== 'number' || n <= 0) {
      throw new Error('Invalid input');
    }
  
    let result = [];
    for (let i = 0; i < array.length; i += n) {
      result.push(array.slice(i, i + n));
    }
  
    return result;
  }

async function main() {

    try{

        const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
        const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

        const allSolWallets = JSON.parse(fs.readFileSync('FinalSol.json'))

        if (myAccountId == null ||
            myPrivateKey == null) {
            throw new Error("Environment variables myAccountId and myPrivateKey must be present");
        }

        const client = Client.forMainnet();

        client.setOperator(myAccountId, myPrivateKey);

        let memo = `Set Free Flip`
        let cid = config.contractID

        const nestedArray = chunkArray(allSolWallets, 100)
        let count = 0

        for(const addresses of nestedArray){

            let freeFlipAmount = 1
            let tx = new ContractExecuteTransaction()
                .setContractId(cid)
                .setGas(1500000)
                .setMaxTransactionFee(new Hbar(5))
                .setFunction('addFreeFlips', new ContractFunctionParameters()
                .addAddressArray(addresses)
                .addUint256(freeFlipAmount))
                .setTransactionMemo(memo)
                
            var contractExecuteSubmit = await tx.execute(client);
            var receipt = await contractExecuteSubmit.getReceipt(client)
            count ++
            console.log(`Done setting ${count}/${nestedArray.length}`)

        }

    }catch(e){
        console.log(e)
    }

    
}
main();