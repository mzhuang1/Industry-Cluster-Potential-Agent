#!/bin/bash

# Build and start the Docker containers
echo "Building and starting Docker containers..."
docker-compose up --build -d

# Check if the build was successful
if [ $? -eq 0 ]; then
  echo "Docker Compose build completed successfully!"
  echo "The application should be running at http://localhost:8000"
  echo "You can check the logs with: docker-compose logs -f app"
else
  echo "Docker Compose build failed. Please check the error messages above."
fi