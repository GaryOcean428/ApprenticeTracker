# Fair Work Commission API Integration

## Overview
The Fair Work Commission's Modern Awards Pay Database API provides access to current apprentice wage rates and other employment-related data. This API is essential for ensuring compliance with Australian employment regulations.

## API Key Setup
The application uses the Fair Work Commission's Modern Awards Pay Database API to fetch current apprentice wage rates. You need to:

1. Ensure the API key is properly set in environment variables (`FAIRWORK_API_KEY`) or the `api_keys` table in Supabase
2. Verify that the edge functions are properly deployed to your Supabase project:
   - `auth-fairwork` - Proxies requests to the Fair Work API with proper authentication
   - `get-fairwork-api-key` - Retrieves the API key securely
   - `sync-award-rates` - Performs the data synchronization

## Authentication
All API endpoints require the header:
```
Ocp-Apim-Subscription-Key: <your_api_key>
```

## Key Endpoints

### 1. Awards
**Endpoint**: `GET /api/v1/awards`
Retrieves all modern awards with details such as award code, name, operative dates, and version information.

### 2. Classifications
**Endpoint**: `GET /api/v1/classifications`
Retrieves all classification pay rates, including base rates, calculated rates, classification levels, and effective dates.

### 3. Wage Allowances
**Endpoint**: `GET /api/v1/wage-allowances`
Retrieves all monetary allowances added to ordinary pay, including allowance amount, payment frequency, and applicability.

### 4. Expense Allowances
**Endpoint**: `GET /api/v1/expense-allowances`
Retrieves all expense-related allowances with details on payment frequency, last adjustment date, and CPI information.

### 5. Penalties
**Endpoint**: `GET /api/v1/penalties`
Retrieves all penalty rate adjustments, including calculated values, descriptions, and applicable conditions.

## Troubleshooting

### Common Error Messages
* **"API key not available from any source"** - The API key isn't available in either the environment variables or the `api_keys` table
* **"Failed to fetch data from Fair Work API"** - The edge function couldn't connect to the Fair Work API
* **"Not authenticated, cannot sync to database"** - User must be logged in to sync data
* **"Some awards failed to sync"** - Some data was successfully synced but errors occurred with certain awards

### Edge Function Deployment
If you're seeing a 404 error when calling edge functions, they may not be deployed. Execute these steps:

1. Make sure Supabase CLI is installed: `npm install -g supabase`
2. Link your project: `supabase link --project-ref <your-project-ref>`
3. Deploy the functions: `supabase functions deploy auth-fairwork`

If you don't have access to the CLI, use the Supabase Dashboard to deploy the functions.