'use strict';
var CryptoJS = require('crypto-js');
var express = require('express');
var bodyParser = require('body-parser');

var creatorID = 'Kwoak';
var http_port = process.argv[2] || 3000;
var p2p_port = 6002;

class Block {
    constructor(id, previousHash, data, hash, creatorID) {
        this.id = id;
        this.previousHash = previousHash;

        // soit data directement selon l'objet reçu
        this.data = data;

        this.hash = hash;
        this.creatorID = creatorID;
    }
}

class BlockchainPeer {
    constructor(url) {
        this.url = url;
    }
}

var nodes = [];

var calculateHash = data => {
    return CryptoJS.SHA256(JSON.stringify(data)).toString();
};

var getGenesisBlock = () => {
    const data = {
        pagenumber: [],
        text: []
    };
    return new Block(0, '0', data, calculateHash(data), creatorID);
};

var blockchain = [getGenesisBlock()];

var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));
    app.post('/addBlock', (req, res) => {
        var newBlock = generateNextBlock(req.body.data);
        addBlock(newBlock);
        console.log('block ajouté : ' + JSON.stringify(newBlock));
        res.send();
    });

    app.post('/addPeer', (req, res) => {
        let nodeList = req.body.urls;
        if (!nodeList) return res.sendStatus(500);
        nodeList.forEach(n => {
            if (n.url !== req.headers.host) {
                let node = new BlockchainPeer(n.url);
                console.log(n.url);
                nodes.push(node);
            }
        });

        res.json(nodes);
    });

    app.get('/peers', (req, res) => {
        if (nodes.length < 1) return res.send('No Nodes');
        let count = 0;
        nodes.forEach((n, i, nodes) => {
            let url = `http://${n.url}/blocks`;
            fetch(url)
                .then(r => r.json())
                .then(otherChain => {
                    count += 1;
                    if (blockchain.blocks.length < otherChain.blocks.length) blockchain = otherChain;
                    if (count == nodes.length) return res.send(blockchain);
                })
                .catch(err => res.send(err));
        });
    });
    app.listen(http_port, () => console.log('Écoute HTTP sur le port : ' + http_port));
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

var getLatestBlock = () => blockchain[blockchain.length - 1];

initHttpServer();
