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
    const { staff, observations, startHour } = req.body; // ✨ Extract startHour

    // Validate input
    if (!staff || !observations) {
      return res.status(400).json({
        success: false,
        error: 'Missing staff or observations data'
      });
    }

    // ✨ Log the startHour for debugging
    console.log(`Starting async solve for ${staff.length} staff, ${observations.length} observations, startHour: ${startHour || 8}`);

    // Call Railway API async endpoint with secure API key
    const response = await fetch('https://pythonsolver-production.up.railway.app/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.RAILWAY_API_KEY  // Secure!
      },
      body: JSON.stringify({
        staff,
        observations,
        startHour: startHour || 8  // ✨ Pass startHour with default fallback
      })
    });

    const data = await response.json();

    console.log(`Job started: ${data.job_id || 'unknown'}`);

    // Return the job_id for async polling (202 Accepted)
    return res.status(response.ok ? 202 : response.status).json(data);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
}