# Use Node.js for building the frontend
FROM node:18-alpine AS frontend-build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend code
COPY . .

# Clean any potential build artifacts
RUN rm -rf dist && \
    rm -rf node_modules/.cache && \
    rm -f *.tsbuildinfo && \
    rm -f vite.config.d.ts

# Build the frontend with explicit steps
RUN npx tsc --noEmit && npx vite build

# Use Python for the backend
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy built frontend from the previous stage
COPY --from=frontend-build /app/dist /app/static

# Expose the port
EXPOSE 8021

# Command to run the application
CMD ["python", "main.py"]