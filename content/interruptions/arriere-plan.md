+++
title = "Ce qui se passe sans qu'on le voit"
weight = 3
+++

Comme on l'a dit sur la page précédente, un traitant d'interruption ne
se comporte pas totalement comme une fonction classique. Certaines choses
sont différentes au niveau du compilateur et du matériel charger de gérer les
interruptions.

En général, une fonction n'a que quelques registres à sauvegarder et restaurer,
et c'est à la fonction appelante de sauvegarder le reste si elle en a besoin.
Le souci avec les interruptions, c'est qu'on ne sait pas à quel moment elles peuvent
arriver : le compilateur ne peut pas ajouter les instructions de sauvegarde des registres
avant que le traitant se lance, puisqu'on ne sait pas quand le traitant va se lancer.
Le traitant doit donc sauvegarder et restaurer *tous* les registres. La ligne `__attribute__((interrupt))`
sert à indiquer au compilateur de rajouter les instructions pour celà.

Quand on appelle un traitant, le processeur va aussi changer de mode : on doit toujours être
en mode « noyau » (privilégié) quand on exécute un traitant, même si on était en train d'exécuter
du code en mode « utilisateur » au moment où l'interruption est apparue.

En plus de ça, appeler un traitant demande de mofidier `lr`, `sp` et `pc` comme pour une
fonction classique. Mais pour se simplifier la tâche et éviter de devoir sauvegarder et restaurer
ces registres, ils sont en réalité dupliqués, et chaque mode a sa copie de ces registres.
En plus de ça, on peut ainsi accéder aux anciennes valeurs de ces registres : imaginons
que le processeur émette une interruption parce qu'une instruction qui n'existe pas vient
d'être exécutée, c'est utile de savoir l'ancienne valeur de `pc` pour savoir à quel endroit
du programme se trouve cette instruction invalide.

Une fois que le traitant a été exécuté, il faut restaurer les registres et reprendre l'éxécution
normale du code. Pour la plupart des registres pas de souci, on reprend la valeur qu'on avait sauvegardé
en mémoire. Mais pour `pc` et `cpsr` on a un problème : lequel restaurer en premier ?
Si on restaure d'abord `pc`, on va sauter ailleurs dans le code, et l'instruction pour restaurer `cpsr`
ne sera jamais exécutée. Si on change d'abord `cpsr`, le mode du processeur va changer, et lorsqu'on voudra
faire `mov pc, lr` pour revenir là où on était avant, `lr` désignera la version originale du registre, pas
celle valable dans le traitant, donc on ne sautera pas au bon endroit. En ARM, il y a donc une instruction dédiée
pour faire cette opération : `movS pc, lr`.