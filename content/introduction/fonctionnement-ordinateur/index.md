+++
title = "Le fonctionnement d'un ordinateur"
weight = 1
+++

Un ordinateur est une machine capable d'exécuter des **programmes** pour traiter
des **informations**. Pour celà, il a besoin de plusieurs composants :

- un **processeur** qui décode les instructions du programme et les exécute ;
- de la **mémoire vive** qui permet de stocker des informations, qui pourront être écrites ou lues ;
- un (ou plusieurs) **disque** qui permet aussi de stocker des informations, mais qui reste dans le même état
  même si l'ordinateur est éteint ;
- éventuellement d'autres périphériques : carte réseau, carte son, port USB, etc.

Pour dialoguer entre eux, les composants sont reliés par des « bus ».

Lors du démarrage de l'ordinateur, c'est un composant appelé **carte mère** qui démarre en premier.
Elle alimente les autres composants, et demande au processeur d'exécuter un programme
d'amorçage (BIOS ou UEFI). Ce premier programme va en général charger et lancer un système
d'exploitation.

Le but de ce cours est de comprendre comment un système d'exploitation peut exploiter les composants matériels
et permettre à d'autres programmes d'y accéder.