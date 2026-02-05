# Firebase Backend Performance Optimization Guide

## Changes Made to Improve API Speed

### 1. **Cloud Function Configuration** (`server.js`)
Added performance optimizations:
- **minInstances: 1** - Keeps at least 1 instance warm to avoid cold starts
- **memory: "512MiB"** - Increased memory for better performance
- **concurrency: 80** - Allows multiple requests on same instance
- **timeoutSeconds: 60** - Adequate timeout for API operations

### 2. **MongoDB Connection Caching** (`config/database.js`)
- Reuses database connections across Cloud Function invocations
- Adds connection pooling (maxPoolSize: 10, minPoolSize: 2)
- Optimizes timeouts for faster connections
- Uses IPv4 only to avoid IPv6 lookup delays

### 3. **Runtime Specification** (`firebase.json`)
- Explicitly sets Node.js 22 runtime

## Deployment Instructions

### Deploy the optimized backend:
```bash
cd backend
firebase deploy --only functions
```

### Monitor the deployment:
After deployment, check the Cloud Functions console to verify:
- Minimum instances are running
- Memory allocation is 512MB
- Cold start times are reduced

## Expected Performance Improvements

### Before Optimization:
- **Cold Start**: 5-10 seconds
- **Warm Request**: 200-500ms
- **Frequent Cold Starts**: Every few minutes of inactivity

### After Optimization:
- **Cold Start**: 2-4 seconds (still occurs but less frequent)
- **Warm Request**: 100-300ms
- **Reduced Cold Starts**: minInstances keeps function warm

## Cost Considerations

**Important**: Setting `minInstances: 1` means you'll pay for at least 1 instance running 24/7.

### Estimated Monthly Cost:
- **1 instance @ 512MB**: ~$12-15/month (always running)
- **Additional instances**: Only when needed (auto-scales)

### To Reduce Costs:
If budget is a concern, you can adjust:
```javascript
minInstances: 0,  // No always-on instances (more cold starts)
memory: "256MiB", // Less memory (slower but cheaper)
```

## Alternative: Use Cloud Run Instead

For even better performance and cost efficiency, consider migrating to Cloud Run:
- Faster cold starts
- Better pricing model
- More control over scaling

## Monitoring Performance

### Check function logs:
```bash
firebase functions:log
```

### View metrics in Firebase Console:
1. Go to Firebase Console → Functions
2. Click on your `api` function
3. View metrics: invocations, execution time, errors

## Troubleshooting

### If API is still slow:
1. **Check MongoDB Atlas region** - Should be close to Cloud Function region (us-central1)
2. **Verify minInstances** - Check if instances are staying warm
3. **Monitor cold starts** - Look for "Using cached MongoDB connection" in logs
4. **Check rate limiting** - Ensure it's not blocking requests

### Verify MongoDB connection is cached:
Look for this in logs:
```
"Using cached MongoDB connection"
```

If you see frequent "MongoDB Connected" messages, caching isn't working.

## Additional Optimizations (Optional)

### 1. Add Redis for caching:
```bash
npm install redis
```

### 2. Implement response caching:
Cache frequently accessed data (tours, countries) in memory or Redis

### 3. Use CDN:
Serve static assets and cached API responses through Firebase Hosting

### 4. Database Indexing:
Ensure MongoDB has proper indexes on frequently queried fields

## Region Configuration

Current region: **us-central1**

To change region, update in `server.js`:
```javascript
region: "asia-south1", // For India
region: "europe-west1", // For Europe
```

**Important**: Choose a region close to:
1. Your MongoDB Atlas cluster
2. Your primary users

## Next Steps

1. Deploy the changes
2. Monitor performance for 24 hours
3. Check Cloud Functions metrics
4. Adjust minInstances/memory if needed
5. Consider MongoDB Atlas region optimization
