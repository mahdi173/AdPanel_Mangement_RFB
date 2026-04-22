<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## How to launch the app

1. **Prerequisites**: Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.
2. **Start the containers**:
   ```bash
   docker compose up --build
   ```
3. **Access the application**: Open your browser and go to `http://localhost:3000`.

---

## Race Conditions

### 1. Concurrent Panel Status Update

**Description** : Cette condition survient lorsque deux utilisateurs tentent de modifier l'état `isFilled` d'un même AdPanel au même moment.

- **Détails** : L'application récupère l'objet `Panel`, le modifie en mémoire, puis le sauvegarde. Si deux demandes se mélangent, la dernière demande prendra le dessus sur la première.
- **Solution** : L'ajout de l'**Optimistic Locking**.

### 2. Stripe Webhook

**Description** : Stripe peut envoyer le même événement plusieurs fois (retry logic), ou un délai de synchronisation peut exister.

- **Détails** : Si le même événement est traité deux fois, cela peut corrompre les données utilisateur.
- **Solution** : Utilisation d'une table pour stocker les IDs d'événements Stripe et garantir qu'un événement n'est traité qu'une seule fois.

### 3. Chat Duplicte Message

**Description** : L'envoi multiple de messages causé par des clics rapides (Double-Click Race).

- **Détails** : Chaque clic génère une requête `POST`. Sans protection, cela crée des messages identiques en base de données.
- **Solution** : Le client génère un `UUID` unique pour chaque message. Le serveur refuse toute insertion si l'UUID a déjà été reçu.

### 4. Group Assignment Conflict

**Description** : Conflit lors de l'assignation d'un panneau à un groupe par plusieurs administrateurs.

- **Détails** : Des erreurs de cohérence peuvent survenir si deux admins modifient les relations en même temps.
- **Solution** : Utilisation de `pessimistic_write` et de transactions SQL pour verrouiller la ligne du panneau pendant l'assignation.

---
