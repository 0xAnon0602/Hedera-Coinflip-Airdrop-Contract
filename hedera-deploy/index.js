const {
    Client,
    PrivateKey,
    Hbar,
    AccountId,
    FileCreateTransaction,
    FileAppendTransaction,
    ContractCreateTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();
const stakingContract = require('./contracts/bytecode.json')
const fs = require('fs');
const config = require('./config.json')

async function main() {
    
    const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
    const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

    if (myAccountId == null ||
        myPrivateKey == null) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    const client = Client.forMainnet();

    client.setOperator(myAccountId, myPrivateKey);
    const filecreatetx = new FileCreateTransaction().setKeys([myPrivateKey])
    const fileCreateSubmit = await filecreatetx.execute(client);
    const fileCreateReceipt = await fileCreateSubmit.getReceipt(client)
    const bytecodeFileID = fileCreateReceipt.fileId
    console.log('bytecode file id:',bytecodeFileID.toString())

    const bytecode = stakingContract.bytecode
    const fileAppend = new FileAppendTransaction().setFileId(bytecodeFileID).setContents(bytecode).setMaxChunks(10).setMaxTransactionFee(new Hbar(2))
    const fileAppendSubmit = await fileAppend.execute(client)
    const fileAppendRx = await fileAppendSubmit.getReceipt(client)

    const createContractTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileID)
        .setGas(3000000)
        .setAdminKey(myPrivateKey)
        .setTransactionMemo('Coinflip test')
        .setMaxTransactionFee(new Hbar(10))
    
    const contractCreateSubmit = await createContractTx.execute(client)
    const contractCreateRx = await contractCreateSubmit.getReceipt(client)

    const contractID = contractCreateRx.contractId
    const contractSolAddr = contractID.toSolidityAddress()
    
    console.log("contract id:",contractID.toString())
    console.log("contract sol address:",contractSolAddr)

    config.contractID = contractID.toString()
    config.conttractSol = contractSolAddr
    
    fs.writeFileSync('./config.json', JSON.stringify(config))
    
}
main();