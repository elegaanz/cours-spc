+++
title = "Partitions"
weight = 2
+++

Dans certains cas, on peut vouloir utiliser plusieurs systèmes de fichier sur un même disque. Par exemple, si on a à la fois Windows et Linux installé sur un même ordinateur, chacun a besoin de son propre système de fichier. On peut aussi choisir de faire une séparation entre les données du système et ses fichiers personnels, pour faciliter les réinstallations (on peut ré-écrire uniquement sur les fichiers du système sans perdre ses données personnelles) ou les sauvegardes (on peut copier tout son système de fichier personnel en laissant de côté celui du système).

Pour diviser le disque ainsi, on utilise des **partitions**. Au début du disque, on trouve une *table de partition* qui explique comment le disque est découpé : c'est un liste qui pour chaque partition donne son nom, son octet de départ et de fin, et le type de système de fichier qu'elle contient.

Il existe deux systèmes de partitionnement : **MBR** (Master Boot Record) qui est ancien et qui ne supporte qu'un petit nombre de partition dans sa table, et **GPT** (GUID Partition Table) qui permet d'avoir beaucoup plus de partitions et qui est en général utilisé aujourd'hui.

## Volumes logiques

Sous Linux, il existe une alternative aux partitions : LVM (Logical Volume Manager). Ce système permet aussi de diviser son disque entre plusieurs systèmes de fichiers, mais a l'avantage qu'on peut très facilement les redimensionner après leur création.
