# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalare dependințe sistem
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiere requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiere cod
COPY backend/app ./app

# Port
EXPOSE 8000

# Copy start script
COPY start.sh .
RUN chmod +x start.sh

# Comandă pornire
CMD ["./start.sh"]
