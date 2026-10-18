// netlify/functions/utils/authMiddleware.js
const jwt = require('jsonwebtoken');

const withAuth = (handler) => {
  return async (event, context) => {
    if (event.httpMethod !== "POST") {
      return { 
        statusCode: 405, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Method Not Allowed" }) 
      };
    }

    const authHeader = event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { 
        statusCode: 401, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Unauthorized. Missing token." }) 
      };
    }

    // Split "Bearer <token>" to extract the token string
    const token = authHeader.split(" ")[1]; 

    try {
      const SECRET_KEY = process.env.JWT_SECRET_TOKEN;
      if (!SECRET_KEY) {
        throw new Error("Server misconfiguration: JWT_SECRET_TOKEN environment variable is missing.");
      }

      // Verify token authenticity and expiration
      const decodedUser = jwt.verify(token, SECRET_KEY); 
      
      // Attach the validated user details directly to context
      context.user = decodedUser;

      return await handler(event, context);
      
    } catch (error) {
      console.error("Auth Failure:", error.message);
      
      let errorMessage = "Forbidden or invalid token";
      let statusCode = 403;

      // Specifically inform frontend if token expired so it can attempt a refresh
      if (error.name === 'TokenExpiredError') {
        errorMessage = "TokenExpired";
        statusCode = 401;
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = "Malformed or invalid token signature";
        statusCode = 401;
      }

      return { 
        statusCode, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: errorMessage }) 
      };
    }
  };
};

module.exports = withAuth;
