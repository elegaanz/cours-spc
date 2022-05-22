+++
title = "Un mécanisme pour réagir au monde extérieur"
weight = 1

[extra]
illus = "../stop.avif"
+++

Un système d'exploitation n'existe pas dans le vide : il se repose
et interagit avec du matériel, et il peut y avoir d'autres programmes
qui tournent sur la même machine que lui.

Pour lui permettre d'être réactif à des événements extérieurs, il existe
un mécanisme dédié : les **interruptions**. Grâce à ce système, on va pouvoir
dire au processeur « Quand tel type d'événement arrive, arrête ce que tu fais,
et appelle telle fonction ».

Les fonctions appelées avec ce mécanisme sont appelées des *traitants d'interruption*.

Il existe trois grands type d'événements auxquels on peut réagir :

- les **interruptions matérielles**, quand un périphérique veut nous signaler
  que quelque chose de particulier se passe (laps de temps écoulé sur l'horloge,
  clé USB branchée, paquet reçu sur la carte réseau, etc).
- les **erreurs**, quand le processeur veut nous signaler qu'il ne peut pas faire
  ce qu'on lui demande (division par zéro, accès invalide à la mémoire, etc).
- les **appels système**, qui sont un mécanisme pour permettre aux programmes utilisateur
  de communiquer avec le système d'exploitation (c'est par exemple ce qui est utilisé pour
  lire et écrire dans des fichiers).

Dans tous les cas, les interruptions fonctionnent de la même façon.