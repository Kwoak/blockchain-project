'use strict';
var CryptoJS = require('crypto-js');
var express = require('express');
var bodyParser = require('body-parser');
var fetch = require('node-fetch');

var creatorID = 'Kwoak';
var http_port = process.argv[2] || 3000;
// var http_ports = process.argv || [3000];

class Block {
    constructor(id, previousHash, data, hash, creatorID) {
        this.id = id;
        this.previousHash = previousHash;
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

var nodes = [];
var blockchain = [getGenesisBlock()];

var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));

    app.post('/addBlock', (req, res) => {
        var spawn = require('child_process').spawn;
        var process = spawn('python', ['../ALGO/getFilePage.py', req.query.number]);
        process.stdout.on('data', function(data) {
            console.log('on est là ?');
            res.send(data);
        });

        // var newBlock = generateNextBlock(req.body.data);
        // addBlock(newBlock);
        // res.send();
    });

    // app.post('/addPeer', (req, res) => {
    //     const nodeList = req.body.urls;
    //     if (!nodeList) return res.sendStatus(400);
    //     nodeList.forEach(n => {
    //         const exists = nodes.some(p => p.url === n.url);
    //         if (n.url !== req.headers.host && !exists) {
    //             const node = new BlockchainPeer(n.url);
    //             nodes.push(node);
    //         }
    //     });

    //     res.json(nodes);
    // });

    app.get('/synchronize', (req, res) => {
        if (nodes.length < 1) return res.send('No peers connected');
        let count = 0;
        http_ports.forEach((n, i, nodes) => {
            let url = `http://localhost:${n.url}/blocks`;
            fetch(url)
                .then(r => r.json())
                .then(otherChain => {
                    count += 1;
                    if (blockchain.length < otherChain.length) blockchain = otherChain;
                    if (count == nodes.length) return res.send(blockchain);
                })
                .catch(err => res.send(err));
        });
    });

    // http_ports.forEach(http_port => {
    app.listen(http_port, () => console.log('Écoute HTTP sur le port : ' + http_port));
    // });
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
