# HackHub AI Platform Notes & Instructions

> [!IMPORTANT]
> **Render Free Tier Cold-Start Note**:
> When running on Render's free tier, backend web services automatically spin down after inactivity. A cold start takes approximately 30-60 seconds and may initially make the database or API appear unresponsive.
> 
> **Judging Demo Tip**: Send a single GET ping to `https://<your-backend-render-domain>/api/health` about 1 minute before your live demo to warm up the backend server and ensure sub-second response times!
