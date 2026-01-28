# Troubleshooting Guide

## 403 Forbidden Error on Send OTP

If you're getting a 403 error when trying to send OTP, follow these steps:

### 1. Check if Backend Server is Running

```bash
cd backend
npm start
# or
npm run dev
```

The server should start on `http://localhost:5001`

### 2. Test Backend Connectivity

Open in browser or use curl:
```bash
curl http://localhost:5001/api/health
```

Should return: `{"status":"ok","message":"Server is running"}`

### 3. Test OTP Endpoint Directly

```bash
curl -X POST http://localhost:5001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

### 4. Check Frontend Proxy

Make sure `frontend/vite.config.js` has the proxy configured:
```js
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
    secure: false
  }
}
```

### 5. Restart Both Servers

1. Stop backend server (Ctrl+C)
2. Stop frontend server (Ctrl+C)
3. Restart backend: `cd backend && npm start`
4. Restart frontend: `cd frontend && npm run dev`

### 6. Check Browser Console

Look for:
- Network errors
- CORS errors
- Any other error messages

### 7. Check Backend Logs

The backend should log:
- `Server is running on port 5001`
- `Send OTP request received: ...` (when request comes in)
- `OTP for {phone}: {otp}` (OTP generated)

### 8. Common Issues

**Issue**: Backend not running
- **Solution**: Start backend server

**Issue**: Port 5001 already in use
- **Solution**: Change PORT in `.env` or kill process using port 5001

**Issue**: CORS blocking
- **Solution**: CORS is configured, but restart both servers

**Issue**: Proxy not working
- **Solution**: Restart frontend dev server

### 9. Verify Environment Variables

Make sure `backend/.env` exists (even if empty):
```env
PORT=5001
JWT_SECRET=your-secret-key
```

### 10. Test with Direct API Call

If proxy isn't working, try calling backend directly:
```javascript
// In browser console or frontend code
fetch('http://localhost:5001/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '9876543210' })
})
.then(r => r.json())
.then(console.log)
```

## Still Having Issues?

1. Check backend terminal for error messages
2. Check browser Network tab for request/response details
3. Verify both servers are running on correct ports
4. Try clearing browser cache
5. Restart your development environment
