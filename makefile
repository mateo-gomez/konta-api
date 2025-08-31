# Nombre del proyecto
PROJECT_NAME=konta

# Archivos
DOCKER_COMPOSE=docker compose -f docker-compose.yml
API_NAME=konta-api
DB_NAME=konta-db
PGADMIN_NAME=konta-pgadmin


# -------------------------------
# 🚀 Comandos de Docker
# -------------------------------
up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

restart:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) up -d

logs:
	$(DOCKER_COMPOSE) logs -f $(API_NAME)

ps:
	$(DOCKER_COMPOSE) ps

bash-api:
	$(DOCKER_COMPOSE) exec $(API_NAME) sh

bash-db:
	$(DOCKER_COMPOSE) exec $(DB_NAME) bash

# -------------------------------
# 📦 Prisma
# -------------------------------
prisma-init:
	$(DOCKER_COMPOSE) exec $(API_NAME) npx prisma init

prisma-generate:
	$(DOCKER_COMPOSE) exec $(API_NAME) npx prisma generate

prisma-migrate:
	$(DOCKER_COMPOSE) exec $(API_NAME) npx prisma migrate dev --name init

prisma-studio:
	$(DOCKER_COMPOSE) exec $(API_NAME) npx prisma studio
