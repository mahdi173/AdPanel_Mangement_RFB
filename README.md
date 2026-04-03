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

**Description** : Cette condition survient lorsque deux utilisateurs ou plus tentent de modifier l'état `isFilled` d'un même AdPanel au même moment.

- **Détails** : L'application récupère l'objet `Panel` depuis la base de données, modifie sa propriété en mémoire, puis sauvegarde l'objet entier. Si deux requêtes entrelacent ces étapes, la dernière sauvegarde écrasera la première, ignorant potentiellement une mise à jour intermédiaire.

### 2. Stripe Webhook

**Description** : Un délai de synchronisation existe entre la confirmation de paiement côté Stripe et la mise à jour du `subscriptionStatus` via le **Webhook**.

- **Détails** : Si un utilisateur termine son paiement et rafraîchit immédiatement la page d'accueil avant que le serveur n'ait reçu et traité l'événement `checkout.session.completed`, il verra toujours son bouton "Subscribe" au lieu de son statut actif, créant une confusion sur l'état réel de son abonnement.

### 3. Chat

**Description** : L'envoi multiple de messages causé par des clics rapides sur le bouton "Send".

- **Détails** : Chaque clic génère une requête `POST` distincte vers `/groups/:id/messages`. Si ces requêtes sont traitées, elles créeront des entrées dupliquées avec des IDs différents dans la table `messages`.

### 4. Group Assignment

**Description** : Conflit lors de l'assignation d'un panneau à un groupe par plusieurs administrateurs.

- **Détails** : Lorsque deux administrateurs tentent d'assigner le même panneau à des groupes différents (ou au même groupe) simultanément, des erreurs de contraintes d'unicité ou des états incohérents dans la table de jointure peuvent survenir selon la stratégie de **Locking** utilisée par l'ORM.

---
