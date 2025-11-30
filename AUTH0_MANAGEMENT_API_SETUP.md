# Auth0 Management API Setup for Account Deletion

This guide explains how to set up the Auth0 Management API to enable self-service account deletion.

## Step 1: Create a Machine-to-Machine Application in Auth0

1. Go to your [Auth0 Dashboard](https://manage.auth0.com)
2. Navigate to **Applications** → **Applications**
3. Click **Create Application**
4. Enter a name: `Management API - Account Deletion`
5. Select **Machine to Machine Applications**
6. Click **Create**

## Step 2: Authorize the Application

1. After creating the application, you'll see an authorization screen
2. Select **Auth0 Management API** from the dropdown
3. Click **Authorize**

## Step 3: Grant Permissions

1. In the permissions tab, expand the scopes
2. Find and enable these permissions:
   - `read:users` (to verify user exists)
   - `delete:users` (to delete user accounts)
3. Click **Authorize** at the bottom

## Step 4: Get Your Credentials

1. Go to the **Settings** tab of your new application
2. Copy the following values:
   - **Client ID**
   - **Client Secret** (keep this secure!)
   - **Domain** (should be the same as your main Auth0 domain)

## Step 5: Add Environment Variables

### Local Development (.env file)

Add these to your `.env` file:

```env
# Existing Auth0 variables
REACT_APP_AUTH0_DOMAIN=allocateit.uk.auth0.com
REACT_APP_AUTH0_CLIENT_ID=q9oXVaET2wK5GYkZuC7VhRfDiGScxGJK
REACT_APP_AUTH0_AUDIENCE=https://allocateit.co.uk/api

# NEW: Management API credentials
AUTH0_MANAGEMENT_CLIENT_ID=your_management_client_id_here
AUTH0_MANAGEMENT_CLIENT_SECRET=your_management_client_secret_here
```

### Production (Vercel Environment Variables)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `AUTH0_MANAGEMENT_CLIENT_ID` = your management client ID
   - `AUTH0_MANAGEMENT_CLIENT_SECRET` = your management client secret

**Important:** Make sure to add them to all environments (Production, Preview, Development)

## Step 6: Install Dependencies

Run this command to install the required packages:

```bash
npm install jsonwebtoken jwks-rsa
```

## Step 7: Test the Setup

1. Start your development server: `npm start`
2. Log in to your application
3. Click the **⚙️ Account** button
4. Try deleting a test account
5. Verify the account is deleted in Auth0 Dashboard → **User Management** → **Users**

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit the `.env` file** - It's already in `.gitignore`
2. **Keep the Management Client Secret secure** - It has powerful permissions
3. **The API verifies JWT tokens** - Only authenticated users can delete their own accounts
4. **Rate limiting** - Consider adding rate limiting in production
5. **Audit logging** - Auth0 logs all deletions in the dashboard

## Troubleshooting

### Error: "Failed to get management API token"
- Check that `AUTH0_MANAGEMENT_CLIENT_ID` and `AUTH0_MANAGEMENT_CLIENT_SECRET` are correct
- Verify the Machine-to-Machine app is authorized for Auth0 Management API

### Error: "Failed to delete user: Insufficient scope"
- Make sure you granted `delete:users` permission in Step 3
- Re-authorize the application if needed

### Error: "Invalid token"
- Check that `REACT_APP_AUTH0_AUDIENCE` is set correctly
- Verify the user is logged in and has a valid session

## How It Works

1. User clicks "Delete Account" in the dropdown menu
2. Frontend gets the user's Auth0 access token
3. Frontend calls `/api/delete-account` with the token
4. Backend verifies the token is valid
5. Backend gets a Management API token using client credentials
6. Backend calls Auth0 Management API to delete the user
7. User is logged out and redirected to home page
8. The email address is now available for a new account

## Additional Resources

- [Auth0 Management API Documentation](https://auth0.com/docs/api/management/v2)
- [Machine-to-Machine Applications Guide](https://auth0.com/docs/get-started/auth0-overview/create-applications/machine-to-machine-apps)
- [User Delete Endpoint](https://auth0.com/docs/api/management/v2#!/Users/delete_users_by_id)
