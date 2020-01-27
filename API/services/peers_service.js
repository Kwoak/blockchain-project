const WebSocket = require('ws');

const connectToPeers = function connectToPeers(newPeers) {
    // console.log(newPeers);
    newPeers.forEach((peer) => {
        let ws = new WebSocket(peer);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('échec de la connexion')
        });
    });
}

exports.connectToPeers = connectToPeers;