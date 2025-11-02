# Getting Started with Nothink Backend

This guide will help you get the application running on your local machine in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **npm** or **yarn** (comes with Node.js)

## Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Copy the example environment file:

```bash
cp env.example .env
```

> **Note:** The default configuration in `.env.example` is already set up to work with the Docker database. You don't need to change anything unless you want to customize it.

### Step 3: Start the Database

Start PostgreSQL using Docker:

```bash
npm run docker:up
```

This command will:
- Pull the PostgreSQL 16 Alpine image (if not already present)
- Create a database named `nothink_checkout`
- Start the database on port `5432`
- Store data in a persistent Docker volume

To verify it's running:

```bash
docker ps
```

You should see a container named `nothink-postgres` running.

### Step 4: Run Database Migrations (if any exist)

```bash
npm run migration:run
```

> **Note:** If there are no migrations yet, this step is safe to skip.

### Step 5: Start the Application

```bash
npm run start:dev
```

The application will start in watch mode and be available at:
```
http://localhost:3000
```

## Useful Commands

### Docker Management

```bash
# Start the database
npm run docker:up

# Stop the database (keeps data)
npm run docker:down

# View database logs
npm run docker:logs

# Stop and remove all data
docker-compose down -v
```

### Application Commands

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

### Database & Migrations

```bash
# Create a new migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

## Troubleshooting

### Database Connection Issues

If you see "password authentication failed" or "database does not exist":

1. Ensure Docker is running
2. Stop and restart the database:
   ```bash
   npm run docker:down
   npm run docker:up
   ```
3. Check your `.env` file matches these values:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=nothink_checkout
   ```

### Port Already in Use

If port 5432 is already in use:

1. Stop any existing PostgreSQL instances
2. Or change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - '5433:5432'  # Use 5433 on host instead
   ```
3. Update `DB_PORT=5433` in your `.env` file

### Docker Not Starting

- Make sure Docker Desktop is running
- Check Docker Desktop logs for errors
- Restart Docker Desktop if needed

## Next Steps

Once your application is running:

1. **Check the API**: Visit `http://localhost:3000` to see if the server responds
2. **Read the Documentation**: Check `README.md` for project architecture
3. **Explore the Code**: Start with `src/main.ts` and `src/app.module.ts`
4. **Create Your First Module**: Use NestJS CLI to scaffold new features

## Need Help?

- Check the [NestJS Documentation](https://docs.nestjs.com)
- Review the project's `README.md` for architecture details
- Check `cart.plan.md` for implementation roadmap

---

**Happy Coding! 🚀**


