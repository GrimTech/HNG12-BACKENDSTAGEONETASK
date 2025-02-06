require('dotenv').config();

const fastify = require('fastify')({
    logger: {
        level: process.env.LOG_LEVEL || 'info', 
        // prettyPrint: process.env.NODE_ENV !== 'production'
    }
});
const fastifyCors = require('@fastify/cors');

// Register CORS
fastify.register(fastifyCors, {
    origin: '*',
});

// Define the response schema
const responseSchema = {
    type: 'object',
    properties: {
        number: { type: 'integer', format: 'int64'},
        is_prime: { 'type': 'boolean' },
        is_perfect: { 'type': 'boolean' },
        properties: {
                "type": "array",
                "items": {
                "type": "string",
                "enum": ["armstrong", "odd", "even"] // Allowed values
            },
            "oneOf": [ // Enforce valid combinations
                { "const": ["armstrong", "odd"] },    // Armstrong + Odd
                { "const": ["armstrong", "even"] },   // Armstrong + Even
                { "const": ["odd"] },                 // Non-Armstrong + Odd
                { "const": ["even"] }                 // Non-Armstrong + Even
            ],
            "description": "Indicates if the number is Armstrong and/or its parity. Valid combinations: ['armstrong', 'odd'], ['armstrong', 'even'], ['odd'], ['even']."
        },
        digit_sum: { 'type': 'integer', 'format': 'int64' },
        'fun_fact': {'type': 'string'}
    },
    required: ['number', 'is_prime', 'is_perfect', 'properties', 'digit_sum', 'fun_fact']
};

function checkEven( n ) {
    if (n % 2 == 0) {
        return true;
    }
    else { 
        return false;
    }
}

function checkPrime( n ) {
    if ( n <= 1) return false;         // Primes must be > 1
    if ( n <= 3) return true;          // 2 and 3 are primes
    if ( n % 2 === 0) return false;    // Eliminate even numbers
    
    // Check odd divisors up to sqrt(n)
    const limit = Math.sqrt( n );
    for (let i = 3; i <= limit; i += 2) {
        if (n % i === 0) return false;
    }
    
    return true;
}

function checkPerfect( n ) {
    if (n <= 1) return false; // Perfect numbers are > 1
    let sum = 1; // Start with 1 (since 1 is a divisor for all n > 1)
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        sum += i;
        if (i !== n / i) sum += n / i; // Avoid duplicates for squares
      }
    }
    return sum === n;
}

function checkArmstrongNumber( n ) {
    // Convert input to a number and validate
    const number = Number( Math.abs(n) );
    if ( number < 0 ) {
      return false;
    }
  
    // Split into digits and calculate the sum
    const digits = String(number).split('');
    const power = digits.length;
    const sum = digits.reduce((acc, digit) => acc + Math.pow(parseInt(digit, 10), power), 0);
  
    return sum === number;
}
  
function sumOfDigits( n ) {
    // Convert the number to a string and split into an array of digits
    const digits = String( Math.abs(n) ).split('');
    
    // Use reduce to sum the digits
    const sum = digits.reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    
    return sum;
}

// Define the API route with schema validation
fastify.get('/api/classify-number', {
    schema: {
        response: {
            200: responseSchema
        }
    }
}, async (request, reply) => {
    try {
        let input = request.query.number;
        let digit = input === "" || isNaN(Number(input)) ? input : Number( input );
        if ( !Number.isInteger( digit ) ) {
            if ( digit == "" ) {
                throw new Error('nil')
            }
            throw new Error( digit );
        }

        // Prepare the response data object
            const responseData = {
        };

          // Run checks in parallel
        const [isPrime, isPerfect, isArmStrong, isEven, sumDigits, funFactResponse] = await Promise.all([
            checkPrime(digit),
            checkPerfect(digit),
            checkArmstrongNumber(digit),
            checkEven(digit),
            sumOfDigits(digit),
            fetch(`http://numbersapi.com/${digit}/math?json`)
        ]);
         if (!funFactResponse.ok) {
             throw new Error('Fun fact APi is not working');
         }
         const funFactData = await funFactResponse.json();
         responseData.fun_fact = funFactData.text; // Assign the fun fact

        responseData.number = input;
        responseData.is_prime = isPrime;
        responseData.is_perfect = isPerfect;
        responseData.digit_sum = sumDigits;
        responseData.properties = [];

        if ( isArmStrong ) {
            responseData.properties.push('armstrong');
        }
        if ( isEven ) {
            responseData.properties.push('even');
        }
        else {
            responseData.properties.push('odd');
        }

        // Set the response type to JSON
        reply.type('application/json');
        // Send the response
        return responseData;
    } catch (error) {
        // Log the error for debugging
        fastify.log.error(error);

        if (error.message === 'nil') {
            // Respond with 400
            return reply.status(400).send({
                number: '',
                error: true
            });
        }
        else if ( error.message ) {
            // Respond with 400
            return reply.status(400).send({
                number: error.message,
                error: true
            });
        }
        else {
            // Respond with 500
            return reply.status(500).send({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred while processing your request.'
            });
        }
    }
});

// Set the port and host
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Start the server
const start = async () => {
    try {
        await fastify.listen({ host: '0.0.0.0', port: PORT });
        fastify.log.info(`Server listening on http://${HOST}:${PORT} in ${process.env.NODE_ENV} mode`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();