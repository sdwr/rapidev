# Delivery App

A real-time delivery management system with separate interfaces for clients, couriers, and administrators.

## Running the project

1. Clone the repository

2. Run `npm install` in the frontend directory to install the dependencies
3. Run `npm run dev` in the frontend directory to start the frontend server on port 5173

4. Run `npm install` in the backend directory to install the dependencies
5. Run `npm run dev` in the backend directory to start the backend server on port 3333

## Database Setup (PostgreSQL on Linux)

1. Update package list
```
sudo apt update
```
2. Install PostgreSQL and its utilities
```
sudo apt install postgresql postgresql-contrib
```
3. Start and enable the service
```
sudo systemctl start postgresql
sudo systemctl enable postgresql
```
4. Create a new database and user
```
sudo -u postgres psql
CREATE DATABASE rapidev;
CREATE USER rapidev_user WITH ENCRYPTED PASSWORD 'rapidev_pass';
GRANT ALL PRIVILEGES ON DATABASE rapidev TO rapidev_user;
\c rapidev
GRANT ALL ON SCHEMA public TO rapidev_user; 
\q
```


## Making sure the database is running

1. Run `sudo systemctl status postgresql` to check the status of the PostgreSQL service
2. Run `sudo systemctl start postgresql` to start the PostgreSQL service
3. Run `sudo systemctl enable postgresql` to enable the PostgreSQL service to start on boot

## Migrations

1. Run `node ace migration:run` to run the migrations
2. Run `node ace migration:rollback` to rollback the migrations
3. Run `node ace migration:refresh` to refresh the migrations

