// api/solve/[jobId].js - Vercel Serverless Function for polling
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { jobId } = req.query;

    console.log(`Polling job status: ${jobId}`);

    // Call Railway API with secure API key
    const response = await fetch(`https://pythonsolver-production.up.railway.app/solve/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.RAILWAY_API_KEY  // Secure!
      }
    });

    const data = await response.json();
    
    console.log(`Poll result for ${jobId}: ${data.status || 'complete'}`);
    
    // Return the result with appropriate status code
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Polling Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message
    });
  }
}