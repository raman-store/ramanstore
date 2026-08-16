# Render persistent storage

The Raman Store API writes products, orders, sliders, and uploaded media to disk. Production must use a persistent Render disk so catalogue data survives restarts and deployments.

1. In the Render API service, add a persistent disk mounted at `/var/data`.
2. Add the environment variable `STORAGE_DIR=/var/data`.
3. Redeploy the API.

The API will then store JSON records in `/var/data/data` and media files in `/var/data/uploads`. Local development continues to use `apps/api/data` and `apps/api/uploads` when `STORAGE_DIR` is not set.
