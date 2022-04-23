+++
title = "Rappels sur la mémoire"
weight = 1

[extra]
illus = 'illus.avif'
+++

Le principe d'un ordinateur étant de traiter des données, il faut bien un endroit où les stocker.
Dans les processeurs, on retrouve des registres qui peuvent servir à ça.
Mais la quantité d'information qu'un registre peut stocker est très limitée (32 ou 64 bits en général),
et il n'y a pas tant de registres que ça dans un processeur.

Il nous faut donc un espace plus grand pour stocker les informations : la mémoire vive (ou *RAM*,
pour *Random Access Memory*[^random]). Les processeurs proposent des instructions pour lire et
écrire dans cette mémoire.

Une façon très simple de voir la RAM est de la considérer comme un grand tableau à deux colonnes :
une contient les adresses, l'autre la valeur stockée à cette adresse (sur un octet dans la très grande majorité des processeurs).
Il suffit ensuite de se souvenir à quelle adresse on a stocké une donnée et on pourra toujours la retrouver.

## Isolation

Comme on l'a dit dans l'introduction, un des rôles des systèmes d'exploitation est de permettre à plusieurs
processus de tourner en parallèle, sans qu'aucun n'ait accès aux données des autres. Hors si le processeur
propose des instructions pour lire n'importe où dans la mémoire, ça signifie qu'on devrait pouvoir lire
dans la mémoire d'un autre processus (ou même du noyau).

Pour éviter ce gros souci de sécurité, il faut mettre en place un mécanisme de traduction d'adresse.
Les processus vont manipuler des **adresses virtuelles**, et quand un accès à cette adresse sera demandé,
une partie du processeur appelée *Memory Management Unit* (mais tu peux l'appeler *MMU*) va faire la traduction
vers la « vraie » adresse : l'**adresse physique**.

Pour isoler des processus, le noyau n'a qu'à configurer la MMU avant de lancer l'exécution d'un processus de telle
sorte que si une adresse qui n'appartient pas au processus est demandée une erreur sera renvoyée.[^segfault]

Dans la suite, on va voir deux mécanismes de traduction : la **segmentation** et la **pagination**.

[^random]: « Random Access » parce qu'on peut accéder à n'importe quelle adresse à n'importe quel moment, les accès sont imprévisibles, aléatoires (par opposition à d'autres mémoires qui doivent être lues dans un ordre bien précis par exemple).

[^segfault]: C'est une des situations qui peut amener à une erreur de segmentation.