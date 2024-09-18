const {
    Client,
    PrivateKey,
    AccountId,
    Hbar,
    ContractExecuteTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();
const config = require('../config.json')

async function main() {

    try{

        const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
        const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

        if (myAccountId == null ||
            myPrivateKey == null) {
            throw new Error("Environment variables myAccountId and myPrivateKey must be present");
        }

        const client = Client.forMainnet();

        client.setOperator(myAccountId, myPrivateKey);

        let memo = `Flipping`
        let cid = config.contractID


        let tx = new ContractExecuteTransaction()
            .setContractId(cid)
            .setNodeAccountIds([new AccountId(3), new AccountId(4)]) 
            .setGas(100000)
            .setMaxTransactionFee(new Hbar(10))
            .setFunction('flip')
            .setTransactionMemo(memo)
            
        var contractExecuteSubmit = await tx.execute(client);
        var receipt = await contractExecuteSubmit.getReceipt(client)
        console.log('Done setting')

    }catch(e){
        console.log(e)
    }

    
}
main();