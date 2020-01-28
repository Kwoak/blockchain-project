class Block {
    constructor(previousId, previousHash, data, hash, creatorid) {
        this.id = previousId;
        this.previousHash = previousHash.toString();
        this.data = {
            pagenumber: [6, 7, 8, 9, 10],
            text: ['a', 'b', 'c', 'd', 'e']
        };
        this.hash = console.log('fonction de création de hash');
        this.creatorid = 'LUCASS';
    }
}
