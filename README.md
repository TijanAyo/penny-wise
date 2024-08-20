# Pennywise - A jeetseed inspired savings API

## Introduction

Pennywise is a simple savings application inspired by my first saving platform, [JetSeed](https://jetseed.com).
It allows users to manage their finances easily and securely.

## Features

- **Account Management**: Users can create and manage their savings accounts.
- **Transactions**:
  - Users can transfer funds into their wallet.
  - Users can receive funds into their wallet.
  - Users can withdraw funds to their linked settlement accounts.
  - Users can make internal transfers between Pennywise accounts (peer-to-peer).

## Technologies Used

- **Programming Language**: TypeScript
- **Backend Framework**: Express.js
- **Database**: MongoDB
- **Queue**: Redis
- **Design Principles**: Object-Oriented Programming (OOP), Dependency Injection
- **Payment Provider**: Flutterwave

## Documentation

Pennywise utilizes Postman for API documentation. You can access the Postman collection link to your Postman collection [here](https://documenter.getpostman.com/view/19118409/2sA3s6E9GL) to learn about the available API endpoints and their functionalities.

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/TijanAyo/penny-wise.git
   ```

2. **Navigate to the project directory**

   ```bash
   cd pennywise
   ```

3. **Install the dependencies**

   ```bash
   yarn install
   ```

4. **Set up environment variables**

   Create a .env file in the root directory and add your environment variables. Make use of `.env.example for reference

5. **Run the application**

   Navigate to the `package.json` file for more start scripts

   ```bash
   # Runs the application in dev mode
   yarn start:dev
   ```

## Disclaimer

Please note that this server is hosted on a free instance, which means it will automatically spin down after 15 minutes of inactivity. To ensure the server is active, kindly hit the health endpoint before making any other requests. This will help confirm that the server is up and running.
