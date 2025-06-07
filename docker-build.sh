#!/bin/bash

# Build the Docker image
echo "Building Docker image..."
docker build -t industrial-cluster-assessment-system .

# Check if the build was successful
if [ $? -eq 0 ]; then
  echo "Docker build completed successfully!"
  echo "You can run the container with: docker run -p 8000:8000 industrial-cluster-assessment-system"
else
  echo "Docker build failed. Please check the error messages above."
fi