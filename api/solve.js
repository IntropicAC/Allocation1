// api/solve.js - Vercel Serverless Function
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { staff, observations } = req.body;

    // Validate input
    if (!staff || !observations) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing staff or observations data' 
      });
    }

    console.log(`Solving for ${staff.length} staff, ${observations.length} observations`);

    // Call Railway API with secure API key
    const response = await fetch('https://pythonsolver-production.up.railway.app/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.RAILWAY_API_KEY  // Secure!
      },
      body: JSON.stringify({ staff, observations })
    });

    const data = await response.json();
    
    console.log(`Solve complete: ${data.success}`);
    
    // Return the result
    return res.status(response.ok ? 200 : 500).json(data);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message
    });
  }
}