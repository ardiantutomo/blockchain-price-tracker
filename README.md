## Running the Application

1. **Build and Run with Docker Compose**

   To build and run the application using Docker Compose, execute the following command:

   ```bash
   docker-compose up --build
   ```

   This command will build the Docker image and start the application on port 3000.

2. **Accessing the API**

   Once the application is running, you can access the API documentation via Swagger at:

   ```
   http://localhost:3000/api
   ```

## API Endpoints

- **GET /prices/hourly**: Get hourly prices for a specific chain.
- **POST /alerts/set-alert**: Set a price alert.
- **GET /prices/swap-rate**: Get swap rate from ETH to BTC.
