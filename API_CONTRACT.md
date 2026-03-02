# API Contract Documentation (Draft)

This document describes the current API endpoints and schemas for the Bridge backend.

## Base URL
Default: `http://localhost:8001/api/v1`

## Modules

### 1. Artists (`/artists`)
Manages artists/groups in the system.

- **GET `/artists`**: List all artists.
  - **Response**: `ArtistResponse[]`
- **POST `/artists`**: Create a new artist.
  - **Request**: `ArtistCreate` (`name: string`, `color?: string`)
  - **Response**: `ArtistResponse`
- **GET `/artists/{id}`**: Get artist details.
- **PATCH `/artists/{id}`**: Update artist.
- **DELETE `/artists/{id}`**: Remove artist.

### 2. Categories (`/categories`)
Manages event categories (e.g., Wedding, Corporate).

- **GET `/categories`**: List all categories.
- **POST `/categories`**: Create a new category.
  - **Request**: `CategoryCreate` (`name: string`)
- **GET `/categories/{id}`**: Get category details.
- **PATCH `/categories/{id}`**: Update category.
- **DELETE `/categories/{id}`**: Remove category.

### 3. Events / Agenda (`/events`)
Manages scheduled events with financial tracking.

- **GET `/events`**: List all events.
- **POST `/events`**: Create a new event.
  - **Request**: `EventCreate`
    - `name`: string
    - `date`: string (ISO date)
    - `artistId`: string (UUID)
    - `categoryId`: string (UUID)
    - `budget`: number
    - `description?`: string
- **GET `/events/{id}`**: Get event details.
- **PATCH `/events/{id}`**: Update event.
- **DELETE `/events/{id}`**: Remove event.

### 4. Bank Accounts (`/accounts`)
Manages bank accounts and balances.

- **GET `/accounts`**: List all accounts.
  - **Response**: `{ "success": true, "data": AccountResponse[] }`
- **POST `/accounts`**: Create a new account.
  - **Request**: `AccountCreate` (`name: string`, `type: string`, `balance: number`, `color: string`, `entity_type?: string`)
  - **Response**: `{ "success": true, "data": AccountResponse }`
- **GET `/accounts/{id}`**: Get account details.
- **PUT `/accounts/{id}`**: Update account.
- **DELETE `/accounts/{id}`**: Remove account.

### 5. Transactions (`/transactions`)
Manages financial movements.

- **GET `/transactions`**: List all transactions.
  - **Query Params**: `account_id`, `event_id`
  - **Response**: `{ "success": true, "data": TransactionResponse[] }`
- **POST `/transactions`**: Create a new transaction.
  - **Request**: `TransactionCreate`
- **GET `/transactions/{id}`**: Get transaction details.
- **PUT `/transactions/{id}`**: Update transaction.
- **DELETE `/transactions/{id}`**: Remove transaction.

## Production Requirements
- All IDs must be valid UUIDs.
- Date strings must follow ISO 8601 format.
- CORS must be configured to allow the authorized frontend origin.
