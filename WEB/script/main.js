const getGenesisBlock = () => {
    return new Block(
        0,
        "0",
        {
            "pagenumber": [6, 7, 8, 9, 10],
            "text" : ["a", "b", "c", "d", "e"]
        },
        "3804fa317801848c5d5b5d22d3b31e9d1385bee62c661c7598db256e866eee0f"
    );
};