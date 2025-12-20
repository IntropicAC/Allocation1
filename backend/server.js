require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Auth0 JWT verification middleware
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// Get Auth0 Management API token
async function getManagementToken() {
  console.log('Requesting Management API token...');

  const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_MGMT_CLIENT_ID,
      client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get management token: ${error}`);
  }

  const data = await response.json();
  console.log('Management API token obtained');
  return data.access_token;
}

// Delete account endpoint
app.delete('/api/account/delete', checkJwt, async (req, res) => {
  try {
    const { userId } = req.body;

    console.log(`Delete request received for user: ${userId}`);

    // Verify the user is deleting their own account
    if (req.auth.sub !== userId) {
      console.log(`Forbidden: User ${req.auth.sub} tried to delete ${userId}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account'
      });
    }

    // Get Management API token
    const mgmtToken = await getManagementToken();

    // Delete user from Auth0
    console.log(`Deleting user ${userId} from Auth0...`);
    const deleteResponse = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${mgmtToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!deleteResponse.ok) {
      const error = await deleteResponse.text();
      console.error(`Failed to delete user: ${error}`);
      throw new Error('Failed to delete user from Auth0');
    }

    // Log the deletion for audit trail
    console.log(`✓ User deleted successfully: ${userId} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message || 'Failed to delete account. Please contact support.'
    });
  }
});

// In-memory job storage (for simple async solver)
const jobs = new Map();

// Solver endpoint - Start async job
app.post('/api/solve', async (req, res) => {
  try {
    const { staff, observations, startHour } = req.body;

    console.log('📥 Received solve request');
    console.log(`  Staff count: ${staff?.length || 0}`);
    console.log(`  Observations count: ${observations?.length || 0}`);
    console.log(`  Start hour: ${startHour}`);

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store job with pending status
    jobs.set(jobId, {
      status: 'pending',
      startTime: Date.now(),
      input: { staff, observations, startHour }
    });

    // Start solving in background (don't await)
    solveProblemAsync(jobId, staff, observations, startHour);

    // Immediately return job ID
    res.status(202).json({
      job_id: jobId,
      message: 'Solving started'
    });

  } catch (error) {
    console.error('❌ Error starting solve job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Poll endpoint - Check job status
app.get('/api/solve/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status === 'pending') {
    const elapsedSeconds = Math.floor((Date.now() - job.startTime) / 1000);
    return res.status(202).json({
      status: 'pending',
      progress: 'Solving...',
      elapsed_seconds: elapsedSeconds
    });
  }

  if (job.status === 'complete') {
    // Return result and clean up
    const result = job.result;
    jobs.delete(jobId);
    return res.status(200).json(result);
  }

  if (job.status === 'error') {
    const error = job.error;
    jobs.delete(jobId);
    return res.status(500).json({
      success: false,
      error: error
    });
  }
});

// Background solver function
async function solveProblemAsync(jobId, staff, observations, startHour) {
  try {
    console.log(`🔧 Starting solve for job ${jobId}`);

    // TODO: Replace this with your actual solver logic
    // For now, this is a simple placeholder that returns the input data
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate solving time

    // Create a simple schedule (placeholder - replace with real solver)
    const schedules = {};
    staff.forEach(member => {
      schedules[member.id] = { ...member.observations };
    });

    // Mark job as complete
    jobs.set(jobId, {
      status: 'complete',
      result: {
        success: true,
        schedules: schedules,
        message: 'Solve completed (placeholder - replace with real solver)'
      }
    });

    console.log(`✅ Solve completed for job ${jobId}`);

  } catch (error) {
    console.error(`❌ Solve failed for job ${jobId}:`, error);
    jobs.set(jobId, {
      status: 'error',
      error: error.message
    });
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AllocateIt Backend API'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AllocateIt Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      deleteAccount: 'DELETE /api/account/delete (requires auth)',
      solve: 'POST /api/solve (start solver job)',
      solvePoll: 'GET /api/solve/:jobId (check job status)'
    }
  });
});

app.listen(PORT, () => {
  console.log(`✓ AllocateIt Backend API running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Auth0 Domain: ${process.env.AUTH0_DOMAIN}`);
});
