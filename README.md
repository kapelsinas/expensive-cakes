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
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

**Multi-Provider Checkout Platform** - A minimal-yet-extensible cart → order → payment system built with NestJS that demonstrates clean architecture, strategic thinking around payment provider abstraction, and production-ready patterns.

### Project Scope

This project implements a complete e-commerce checkout flow with emphasis on:
- **Payment Provider Abstraction**: Clean integration of multiple payment providers (Stripe, PayPal, Manual) using Strategy and Factory patterns
- **Domain-Driven Design**: Well-defined entities with proper relationships and lifecycle management
- **Transactional Consistency**: Safe cart-to-order checkout flow with rollback support
- **Extensibility**: Easy to add new providers and features without breaking existing code
- **Production Mindset**: Audit trails, error handling, and comprehensive logging

### Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Validation**: Zod schemas
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & docker-compose

For detailed implementation plan, see [cart.plan.md](./cart.plan.md)

## Quick Start

Get up and running in 3 simple steps:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp env.example .env

# 3. Start database with Docker
npm run docker:up

# 4. Run migrations (if any)
npm run migration:run

# 5. Start the application
npm run start:dev
```

The application will be available at `http://localhost:3000`

## Project Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker & Docker Compose** (recommended) or PostgreSQL installed locally

### 1. Clone and Install Dependencies

```bash
$ npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (use `env.example` as template):

```bash
# Copy the example file
$ cp env.example .env
```

The default configuration works with the Docker setup below. Update if using a custom PostgreSQL instance.

### 3. Start the Database

#### Option A: Using Docker (Recommended)

Start PostgreSQL with Docker Compose:

```bash
# Start the database in detached mode
$ docker-compose up -d

# Check database is running
$ docker-compose ps
```

To stop the database:

```bash
$ docker-compose down

# To stop and remove data volumes
$ docker-compose down -v
```

#### Option B: Using Local PostgreSQL

If you have PostgreSQL installed locally, create a database:

```sql
CREATE DATABASE nothink_checkout;
```

Update your `.env` file with your local PostgreSQL credentials.

### 4. Run Migrations

Once the database is running, apply migrations:

```bash
# Run pending migrations
$ npm run migration:run
```

### 5. Helpful Commands

```bash
# Docker management
$ npm run docker:up          # Start database
$ npm run docker:down        # Stop database
$ npm run docker:logs        # View database logs

# Database migrations
$ npm run migration:generate # Generate new migration
$ npm run migration:run      # Run migrations
$ npm run migration:revert   # Revert last migration
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
