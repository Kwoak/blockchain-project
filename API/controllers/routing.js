const express = require('express');
const app = express();
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const peers_service = require('../services/peers_service');

const http_port = 3001;
const p2p_port = 6001;
const initialPeers = ["http://localhost:6001"];

let sockets = [];
let MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

// function connectToPeers(newPeers) {
//     // console.log(newPeers);
//     newPeers.forEach((peer) => {
//         let ws = new WebSocket(peer);
//         ws.on('open', () => initConnection(ws));
//         ws.on('error', () => {
//             console.log('échec de la connexion')
//         });
//     });
// }

function initHttpServer() {
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        peers_service.connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, () => console.log('Écoute HTTP sur le port : ' + http_port));
}

function initP2PServer() {
    let server = new WebSocket.Server({ port: p2p_port });
    server.on('connection', ws => initConnection(ws));
    console.log('Écoute du port websocket p2p sur : ' + p2p_port);
}

// function initMessageHandler(ws) {
//     ws.on('message', (data) => {
//         let message = JSON.parse(data);
//         console.log('Message Reçu' + JSON.stringify(message));
//         switch (message.type) {
//             case MessageType.QUERY_LATEST:
//                 write(ws, responseLatestMsg());
//                 break;
//             case MessageType.QUERY_ALL:
//                 write(ws, responseChainMsg());
//                 break;
//             case MessageType.RESPONSE_BLOCKCHAIN:
//                 handleBlockchainResponse(message);
//                 break;
//         }
//     });
// }

function initErrorHandler(ws) {
    let closeConnection = (ws) => {
        console.log('échec de la connexion au pair : ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
}

function initConnection(ws) {
    sockets.push(ws);
    // initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
}

let queryChainLengthMsg = () => ({ 'type': MessageType.QUERY_LATEST });
// let responseChainMsg = () => ({
//     'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchain)
// });
// let responseLatestMsg = () => ({
//     'type': MessageType.RESPONSE_BLOCKCHAIN,
//     'data': JSON.stringify([getLatestBlock()])
// });
// let getLatestBlock = () => blockchain[blockchain.length - 1];

let write = (ws, message) => ws.send(JSON.stringify(message));

initHttpServer();
initP2PServer();
peers_service.connectToPeers(initialPeers);