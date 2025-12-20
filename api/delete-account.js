/**
 * Vercel Serverless Function - Delete Auth0 User Account
 *
 * This endpoint allows authenticated users to delete their own Auth0 account.
 * It verifies the user's JWT token and calls the Auth0 Management API.
 */

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// JWKS client for verifying Auth0 tokens
const client = jwksClient({
  jwksUri: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Verify JWT token
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        issuer: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/`,
        algorithms: ['RS256']
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
  });
}

// Get Auth0 Management API token
async function getManagementToken() {
  const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get management API token');
  }

  const data = await response.json();
  return data.access_token;
}

// Delete user from Auth0
async function deleteUser(userId, managementToken) {
  const response = await fetch(
    `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete user: ${error}`);
  }

  return true;
}

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);

    // Verify the user's token
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (err) {
      console.error('Token verification failed:', err);
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const userId = decoded.sub; // Auth0 user ID (e.g., "auth0|123456")

    console.log('Deleting user:', userId);

    // Get Management API token
    const managementToken = await getManagementToken();

    // Delete the user
    await deleteUser(userId, managementToken);

    console.log('User deleted successfully:', userId);

    // Return success
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      message: error.message
    });
  }
};
