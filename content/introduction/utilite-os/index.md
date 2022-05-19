+++
title = "À quoi sert un système d'exploitation ?"
weight = 2
+++

Avoir un système d'exploitation plutôt que de lancer direcement le programme qui nous
intéresse a trois grands avantages.

## Le partage des ressources

Un système d'exploitation est capable de faire tourner plusieurs programmes en
parallèle, et décide de comment le temps de calcul, la mémoire, les accès aux
périphériques, etc. doivent être partagés entre ces différents programmes.

## L'abstraction du matériel

Bien que les périphériques puissent être regroupés en grandes « familles »,
chaque modèle a ses petites spécificités, et aucun ne fonctionne exactement pareil
(une carte réseau donnée ne fonctionnera sans doute pas pareil qu'un autre modèle, 
alors que les deux sont des cartes réseaux).

Le système d'exploitation sert à faire le pont entre tous les modèles de composants
existant et les programmes. Il se repose pour celà sur des **drivers** (*« pilotes »*)
qui sont des bouts de code expliquant quel protocoles utiliser pour manipuler un
périphérique bien précis. Ces drivers fournissent aux programmes de l'utilisateur une interface
unifiée pour manipuler le matériel : en écrivant un programme qui utilise cette interface,
on peut supporter tout le matériel existant (et même du matériel qui n'existe pas encore).

## L'isolation des programmes pour plus de sécurité

Le système d'exxploitation a un accès privilégié au matériel qui lui permet de
configurer des restrictions pour les programmes utilisateurs. Ils ne peuvent
pas utiliser toutes les instructions du processeur, ils n'ont pas accès à toute la
mémoire vive, etc.

Un programme malveillant ne pourrait donc pas totalement prendre le contrôle de
l'ordinateur, grâce aux limites posées par le système d'exploitation.
