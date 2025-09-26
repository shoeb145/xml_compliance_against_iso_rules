# DigitalOcean Deployment Guide

This application is ready for deployment on DigitalOcean. You can deploy it using either **Docker containers** or **App Platform**.

## Prerequisites

1. **OpenAI API Key** - Required for AI compliance analysis
2. **DigitalOcean Account** with billing set up

## Option 1: DigitalOcean App Platform (Recommended)

### Backend Deployment

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. Configure the **Backend Service**:
   - **Source Directory**: `ai_compliance/Backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `python main.py`
   - **Environment Variables**:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `FLASK_ENV`: `production`
     - `PORT`: `5000`
   - **HTTP Port**: `5000`

### Frontend Deployment

1. Add another service to the same app:
2. Configure the **Frontend Service**:
   - **Source Directory**: `ai_compliance/Frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Run Command**: `npm run preview` (or serve static files)
   - **Environment Variables**:
     - `VITE_API_BASE_URL`: `https://your-backend-app-url/api`
   - **HTTP Port**: `4173`

### Final Steps

1. Review your configuration
2. Deploy the application
3. Your app will be available at the provided URLs

## Option 2: Docker Droplets

### 1. Create a Droplet

1. Create a new Ubuntu 22.04 droplet (minimum 2GB RAM recommended)
2. SSH into your droplet
3. Install Docker and Docker Compose:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   ```

### 2. Deploy Your Application

1. Clone your repository:
   ```bash
   git clone https://github.com/your-username/xml_compliance_against_iso_rules.git
   cd xml_compliance_against_iso_rules
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Update with your actual values:
   ```
   OPENAI_API_KEY=your_actual_api_key
   FLASK_ENV=production
   PORT=5000
   ```

3. Build and run with Docker Compose:
   ```bash
   sudo docker-compose up -d
   ```

4. Check that services are running:
   ```bash
   sudo docker-compose ps
   ```

### 3. Configure Firewall

```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS (if using SSL)
sudo ufw enable
```

### 4. Set up SSL (Optional but Recommended)

Install Certbot for Let's Encrypt:
```bash
sudo apt install certbot nginx -y
sudo certbot --nginx -d your-domain.com
```

## Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for AI analysis | Yes |
| `FLASK_ENV` | Flask environment (`production`) | No |
| `PORT` | Backend port (default: 5000) | No |
| `VITE_API_BASE_URL` | Frontend API endpoint URL | No |

## Health Checks

The application includes health check endpoints:
- Backend: `http://your-backend-url/api/health`
- Frontend: Available at root URL

## Security Considerations

✅ **Implemented:**
- Environment variables for sensitive data
- CORS properly configured
- Security headers in nginx
- No hardcoded secrets in code
- Dockerized for isolation
- Health checks for monitoring

## Monitoring and Logs

- View application logs: `sudo docker-compose logs -f`
- Monitor resource usage: `sudo docker stats`
- Backend health: `curl http://localhost:5000/api/health`

## Scaling

For high-traffic scenarios, consider:
1. Using DigitalOcean Load Balancers
2. Multiple droplets behind the load balancer
3. DigitalOcean Managed Databases (if you add database functionality)
4. CDN for static assets

## Troubleshooting

### Common Issues:

1. **502 Bad Gateway**: Backend service is down
   - Check: `sudo docker-compose logs backend`
   
2. **CORS Errors**: Frontend can't reach backend
   - Ensure `VITE_API_BASE_URL` is correct
   - Check firewall settings

3. **OpenAI API Errors**: Invalid or missing API key
   - Verify `OPENAI_API_KEY` in environment variables
   - Check OpenAI account billing

4. **Build Failures**: Dependencies or build issues
   - Check Docker build logs: `sudo docker-compose logs`
   - Ensure all files are committed to repository

## Support

The application is configured with:
- Production-ready Flask server
- Optimized React build with nginx
- Docker containerization
- Health monitoring
- Security best practices

Your application should be fully ready for DigitalOcean deployment!