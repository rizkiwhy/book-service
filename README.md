# NestJS Book Service

This is a simple NestJS application for managing a book database, running in a Docker environment.

## Prerequisites

- [Docker](https://www.docker.com/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/) installed

## Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd book-service
```

## API Endpoints
- GET /books - Retrieve all books
- GET /books/:id - Retrieve a specific book by ID
- POST /books - Create a new book
- PUT /books/:id - Update a book by ID
- DELETE /books/:id - Delete a book by ID
or localhost:3001/api

## Run the application

```
docker-compose up --build
docker-compose exec app npx prisma migrate dev --name init
docker-compose exec app npm run test
docker-compose down
```