module.exports = function handleBlockchainResponse(message) {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('Dernier block de la blockchain : ' + latestBlockHeld.index + '. Block reçu par le pair : ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("Nous pouvons appondre le block reçu à notre chaîne");
            blockchain.push(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("Nous devons interroger notre chaîne depuis notre pair");
            broadcast(queryAllMsg());
        } else {
            console.log("La blockchain reçue est plus longue que la blockchain actuelle");
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('La blockchain reçue est plus courte que la blockchain actuelle. Ne rien faire.');
    }
}

function replaceChain(newBlocks) {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        console.log('La blockchain reçue est valide. Remplacer la blockchain actuelle par la blockchain reçue.');
        blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('La blockchain reçue est invalide.');
    }
}

function isValidChain(blockchainToValidate) {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
        return false;
    }
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
}

let getLatestBlock = () => blockchain[blockchain.length - 1];
let queryAllMsg = () => ({ 'type': MessageType.QUERY_ALL });
let responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});