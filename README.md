# HNG12-BACKENDSTAGEZEROTASK

## Project Description
This project is a backend API built using Fastify, designed to classify numbers based on various mathematical properties. The API provides information about whether a number is prime, perfect, or an Armstrong number, and it also fetches a fun fact about the number from an external API.

## Features
- Classify numbers as prime, perfect, or Armstrong.
- Fetch fun facts about numbers from the Numbers API.
- Return responses in JSON format.

## Setup Instructions
To run the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/GrimTech/HNG12-BACKENDSTAGEZEROTASK.git
   cd HNG12-BACKENDSTAGEZEROTASK
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

4. **Access the API**:
   Open your browser or use a tool like Postman to access the API at `http://localhost:3000/api/classify-number?number=<your_number>`.

## API Documentation

### Endpoint URL
- `GET /api/classify-number?number=<your_number>`

### Request Format
- **Method**: GET
- **Query Parameters**:
  - `number`: The number to classify (must be an integer).

### Response Format
- **Success Response** (HTTP Status 200):
  ```json
  {
      "number": 28,
      "is_prime": false,
      "is_perfect": true,
      "digit_sum": 10,
      "properties": ["even", "armstrong"],
      "fun_fact": "28 is a perfect number."
  }
  ```

- **Error Response** (HTTP Status 400):
  ```json
  {
      "error": true,
      "number": "Invalid number provided."
  }
  ```

- **Error Response** (HTTP Status 500):
  ```json
  {
      "error": "Internal Server Error",
      "message": "An unexpected error occurred while processing your request."
  }
  ```

### Example Usage
To classify a number, you can use the following curl command:

```bash
curl -X GET "http://localhost:3000/api/classify-number?number=28"
```

This will return a JSON response with the classification of the number, including whether it is prime, perfect, and any fun fact associated with it.

## Backlink
For more information on hiring developers, visit: [Hire Node.js Developers](https://hng.tech/hire/nodejs-developers)