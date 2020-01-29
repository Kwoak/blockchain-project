# blockchain-project

Pour lancer le serveur, placez vous dans le dossier `API` puis effectuez les commandes suivantes:

`npm install` afin d'installer toutes les dépendances nécessaires

`npm start {port}` afin de lancer votre serveur en localhost sur un port spécifique (si aucun précisé, le serveur se lancera sur le port 3000)

Une fois votre serveur lancé, voici la liste des différents endpoints à votre disposition ainsi que des exemples de response/body dans chacun des cas:

## `/blocks (GET)`

Affiche la blockchain actuelle du serveur:

-   Response:

```
[
  {
    "id": 0,
    "previousHash": "0",
    "data": [
      {
        "content": [
          ""
        ],
        "idPage": null
      }
    ],
    "hash": "4cbb109ebce0f0025d2ec1250f65b4797a640cb77b27f79ea9217f096f17b844",
    "creatorID": "Kwoak"
  }
]
```

## `/addBlock (POST)`

Permet d'ajouter un bloc à la BlockChain

-   Response:

```
200 OK
```

## `/addPeers (POST)`

Permet d'ajouter les noeuds connectés connus

-   Body/Response:

```
{
	"urls": [
		{
			"url": "localhost:3003"
		},
		{
			"url": "localhost:3000"
		}
	]
}
```

## `/synchronize (GET)`

Permet de synchroniser sa blockhain avec les autres noeuds connectés connus (on garde la plus grande)

-   Response:

```
[
  {
    "id": 0,
    "previousHash": "0",
    "data": [
      {
        "content": [
          ""
        ],
        "idPage": null
      }
    ],
    "hash": "4cbb109ebce0f0025d2ec1250f65b4797a640cb77b27f79ea9217f096f17b844",
    "creatorID": "Kwoak"
  },
  {
    "id": 1,
    "previousHash": "4cbb109ebce0f0025d2ec1250f65b4797a640cb77b27f79ea9217f096f17b844",
    "data": {
      "data": [
        {
          "content": [
            "Guy de Maupassant ",
            "Bel-Ami ",
            "Be",
            "Q"
          ],
          "idPage": 1
        },
        {
          "content": [
            "Guy de Maupassant ",
            "Bel-Ami ",
            "roman ",
            "La Bibliothèque électronique du Québec ",
            "Collection ",
            "À tous les vents ",
            "Volume 510 %3A version 1.01",
            "2"
          ],
          "idPage": 2
        },
        {
          "content": [
            "Du même auteur%2C à la Bibliothèque ",
            "Mademoiselle Fifi ",
            "Contes de la bécasse ",
            "Pierre et Jean ",
            "Sur l’eau ",
            "La mais",
            "on Tellier ",
            "La petite Roque ",
            "Une vie ",
            "Fort comme la mort ",
            "Clair de lune ",
            "Miss Harriet ",
            "La main gauche ",
            "Yvette ",
            "L’inutile beauté ",
            "Monsieur Parent ",
            "Le Horla ",
            "Les soeurs Rondoli",
            "Le docteur Héraclius Gloss et autres contes ",
            "Les dimanches d’un bourgeois de Paris ",
            "Le rosier de Madame Husson ",
            "Contes du jour et de la nuit ",
            "La vie errante ",
            "Notre coeur ",
            "3"
          ],
          "idPage": 3
        },
        {
          "content": [
            "Bel-Ami ",
            "Édition de référence %3A ",
            "Éditions Rencontre%2C Lausanne. ",
            "Texte établi et présenté par Gilbert Sigaux. ",
            "4"
          ],
          "idPage": 4
        },
        {
          "content": [
            "Première partie ",
            "5"
          ],
          "idPage": 5
        }
      ]
    },
    "hash": "c505696ccc465234a1607196dd8eb99bdacea25bceed22606af1b89eb639ebec",
    "creatorID": "Kwoak"
  }
]
```
