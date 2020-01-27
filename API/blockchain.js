'use strict';
var CryptoJS = require('crypto-js');
var express = require('express');
var bodyParser = require('body-parser');
var WebSocket = require('ws');

var creatorID = 'Kwoak';
var http_port = 3001;
var p2p_port = 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

var previousId = 0;
var previousHash = '0';

class Block {
    constructor(id, previousHash, data, hash, creatorID) {
        this.id = id;
        this.previousHash = previousHash;

        // soit data directement selon l'objet reçu
        this.data = {
            pagenumber: [data.pagenumber[0], data.pagenumber[1], data.pagenumber[2], data.pagenumber[3], data.pagenumber[4]],
            text: [data.text[0], data.text[1], data.text[2], data.text[3], data.text[4]]
        };

        this.hash = hash;
        this.creatorID = creatorID;
    }
}

var sockets = [];
var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

var calculateHash = data => {
    return CryptoJS.SHA256(data).toString();
};

var getGenesisBlock = () => {
    previousId = 1;
    previousHash = '0';
    const data = {
        pagenumber: [6, 7, 8, 9, 10],
        text: ['a', 'b', 'c', 'd', 'e']
    };
    return new Block(0, '0', data, calculateHash(data), creatorID);
};

var blockchain = [getGenesisBlock()];

var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));
    app.post('/mineBlock', (req, res) => {
        var newBlock = generateNextBlock(req.body.data);
        addBlock(newBlock);
        broadcast(responseLatestMsg());
        console.log('block ajouté : ' + JSON.stringify(newBlock));
        res.send();
    });
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, () => console.log('Écoute HTTP sur le port : ' + http_port));
};

var initP2PServer = () => {
    var server = new WebSocket.Server({ port: p2p_port });
    server.on('connection', ws => initConnection(ws));
    console.log('Écoute du port websocket p2p sur : ' + p2p_port);
};

var initConnection = ws => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

var initMessageHandler = ws => {
    ws.on('message', data => {
        var message = JSON.parse(data);
        console.log('Message Reçu' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

var initErrorHandler = ws => {
    var closeConnection = ws => {
        console.log('échec de la connexion au pair : ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

var generateNextBlock = blockData => {
    var previousBlock = getLatestBlock();
    var nextID = previousBlock.id + 1;
    var nextHash = calculateHash(blockData);
    return new Block(nextID, previousBlock.hash, blockData, nextHash, creatorID);
};

var addBlock = newBlock => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
};

var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.id + 1 !== newBlock.id) {
        console.log('id invalide');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('previousHash invalide');
        return false;
    } else if (calculateHash(newBlock.data) !== newBlock.hash) {
        console.log(typeof newBlock.hash + ' ' + typeof calculateHash(newBlock.data));
        console.log('hash invalide: ' + calculateHash(newBlock.data) + ' ' + newBlock.hash);
        return false;
    }
    return true;
};

var connectToPeers = newPeers => {
    newPeers.forEach(peer => {
        var ws = new WebSocket(peer);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('échec de la connexion');
        });
    });
};

var handleBlockchainResponse = message => {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => b1.id - b2.id);
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.id > latestBlockHeld.id) {
        console.log('Dernier block de la blockchain : ' + latestBlockHeld.id + '. Block reçu par le pair : ' + latestBlockReceived.id);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log('Nous pouvons appondre le block reçu à notre chaîne');
            blockchain.push(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log('Nous devons interroger notre chaîne depuis notre pair');
            broadcast(queryAllMsg());
        } else {
            console.log('La blockchain reçue est plus longue que la blockchain actuelle');
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('La blockchain reçue est plus courte que la blockchain actuelle. Ne rien faire.');
    }
};

var replaceChain = newBlocks => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        console.log('La blockchain reçue est valide. Remplacer la blockchain actuelle par la blockchain reçue.');
        blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('La blockchain reçue est invalide.');
    }
};

var isValidChain = blockchainToValidate => {
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
};

var getLatestBlock = () => blockchain[blockchain.length - 1];
var queryChainLengthMsg = () => ({ type: MessageType.QUERY_LATEST });
var queryAllMsg = () => ({ type: MessageType.QUERY_ALL });
var responseChainMsg = () => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify(blockchain)
});
var responseLatestMsg = () => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify([getLatestBlock()])
});

var write = (ws, message) => ws.send(JSON.stringify(message));
var broadcast = message => sockets.forEach(socket => write(socket, message));

connectToPeers(initialPeers);
initHttpServer();
initP2PServer();
