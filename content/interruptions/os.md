+++
title = "Du point de vue du système d'exploitation"
weight = 2
+++

Pour indiquer quelle fonction appeler quand un événement arrive, on
place leur adresse dans un tableau appelé **vecteur d'interruptions**.
Chaque type d'événement a un indice précis dans ce tableau, fixé au
niveau du matériel. Si on imagine par exemple qu'on veut réagir aux
accès mémoire invalides, et que sur l'architecture qu'on utilise l'indice
de cette interruption est 3, on fera `vecteur_interruption[3] = mon_traitant;`.

Selon les architectures, on peut soit avoir :

- un vecteur *indirect*, qui contient uniquement les adresses des fonctions (exemple : `0xabc123`). C'est le cas de l'architecture x86 ;
- un vecteur *direct*, qui contient l'instruction de saut vers la fonction (exemple : `b 0xabc123`). C'est le cas en ARM.

Dans tous les cas, si on écrit ces fonctions en C, il faut ajouter `__attribute__((interrupt))` avant leur déclaration,
afin d'informer le compilateur que cette fonction est un traitant d'interruption. En effet, les traitants ne
sont pas tout à fait comme des fonctions classiques (on explique pourquoi dans le chapitre suivant).

```c
__attribute__((interrupt))
void mon_traitant() {
    // …
}
```

Un traitant doit être très court à exécuter. Pendant une interruption, le bit `I` (pour… « Interruption »)
du registre d'état CPSR est mis à 1, et tant qu'il ne revient pas à 0 (c'est-à-dire tant que le traitant n'a
pas fini son travail), les autres interruptions sont ignorées. Si un traitant met trop longtemps à s'exécuter
on peut donc rater d'autres interruptions.