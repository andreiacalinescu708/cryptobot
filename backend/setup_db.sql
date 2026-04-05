-- Setup Database for Crypto Trading Bot
-- Run this in psql or pgAdmin

-- Create database
CREATE DATABASE crypto_trading_bot;

-- Connect to the database
\c crypto_trading_bot;

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created automatically by SQLAlchemy
-- when you run the backend for the first time

-- If you want to create a dedicated user (recommended for production):
-- CREATE USER crypto_bot_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE crypto_trading_bot TO crypto_bot_user;
