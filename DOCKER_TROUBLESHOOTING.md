# Docker Build Troubleshooting Guide

## Issue Overview

Our Docker build is failing with the following error:

```
CANCELED [app stage-1 1/6] FROM docker.io/library/python:3.10-slim@sha256:49454d2bf78a48f217eb25ecbcb4b5face313fea6a6e82706465a6990303ada2 0.2s
=> => resolve docker.io/library/python:3.10-slim@sha256:49454d2bf78a48f217eb25ecbcb4b5face313fea6a6e82706465a6990303ada2 0.0s
=> => sha256:49454d2bf78a48f217eb25ecbcb4b5face313fea6a6e82706465a6990303ada2 9.13kB / 9.13kB 0.0s
=> => sha256:ac71103cf5137882806aad2d7ece409bbfe86c075e7478752d36ea073b0934d7 1.75kB / 1.75kB 0.0s
=> => sha256:e6d8b768c22ff169d0d5b7449ecede9ff35f2cf7f11f401df313e5d57e28c7a4 5.37kB / 5.37kB 0.0s
=> CACHED [app frontend-build 2/6] WORKDIR /app 0.0s
=> ERROR [app frontend-build 3/6] COPY package.json package-lock.json ./
```

The build is failing at the step where it's trying to copy the `package.json` and `package-lock.json` files into the Docker container.

## Possible Causes and Solutions

### 1. Incorrect Build Context

**Problem:** The Docker build context might not include the location where the package.json and package-lock.json files are located.

**Solution:** 
- Check if you're running the Docker build command from the correct directory
- Verify the build context in your docker-compose.yml file

```yaml
services:
  app:
    build:
      context: .  # This should point to the directory containing package.json
      dockerfile: Dockerfile
```

### 2. File Permissions

**Problem:** The package.json and package-lock.json files might have incorrect permissions.

**Solution:**
- Check and update file permissions:
```bash
chmod 644 package.json package-lock.json
```

### 3. File Location/Structure

**Problem:** The package.json and package-lock.json files might not be in the expected location or might have a different name.

**Solution:**
- Verify file existence and location:
```bash
ls -la  # Check if files exist in current directory
find . -name "package*.json"  # Find all package.json files in subdirectories
```

- If your project structure has the frontend in a subdirectory, modify the Dockerfile:
```dockerfile
# Instead of
COPY package.json package-lock.json ./

# Use
COPY frontend/package.json frontend/package-lock.json ./
# OR
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
```

### 4. Dockerfile Structure

**Problem:** The Dockerfile might have an incorrect structure for a multi-stage build.

**Solution:**
- Update the Dockerfile to correctly handle the frontend and backend stages:

```dockerfile
# Use Node.js for building the frontend
FROM node:18-alpine AS frontend-build

# Set working directory
WORKDIR /app

# Copy package files
COPY ./package.json ./package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend code
COPY . .

# Build the frontend
RUN npm run build

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
EXPOSE 8000

# Command to run the application
CMD ["python", "main.py"]
```

### 5. Docker Cache Issues

**Problem:** Sometimes Docker cache can become corrupted or outdated.

**Solution:**
- Rebuild with no cache:
```bash
docker-compose build --no-cache
# OR
docker build --no-cache -t your-image-name .
```

### 6. Path Separator Issues

**Problem:** On Windows, path separators can cause issues with Docker.

**Solution:**
- Ensure consistent path separators in your Dockerfile:
```dockerfile
# Use this (forward slashes)
COPY ./package.json ./package-lock.json ./

# Not this (backslashes, which won't work in Docker)
COPY .\package.json .\package-lock.json .\
```

### 7. Docker Context Size

**Problem:** If your Docker build context is too large, it might time out or fail.

**Solution:**
- Use a .dockerignore file to exclude unnecessary files:
```
node_modules
.git
dist
build
*.md
```

### 8. Symlink Issues

**Problem:** If package.json is a symlink, Docker might not handle it correctly.

**Solution:**
- Check for and resolve symlinks:
```bash
ls -la package.json  # Check if it's a symlink
# If it is, replace it with the actual file
cp -L package.json package.json.real
mv package.json.real package.json
```

### 9. Docker Environment

**Problem:** Your Docker environment might have issues.

**Solution:**
- Check Docker service status:
```bash
systemctl status docker  # Linux
docker info  # General information
```

- Restart Docker:
```bash
systemctl restart docker  # Linux
# For Docker Desktop on Windows/Mac, restart the application
```

### 10. Special Characters in Filenames

**Problem:** Special characters in filenames can cause issues.

**Solution:**
- Ensure your filenames don't contain special characters:
```bash
# Rename if needed
mv package.json package_clean.json
# Then update Dockerfile
COPY package_clean.json ./package.json
```

## Step-by-Step Troubleshooting

1. **Verify file existence and location**:
   ```bash
   ls -la package.json package-lock.json
   ```

2. **Examine the Docker build context**:
   ```bash
   # Create a temporary Dockerfile to debug the context
   echo 'FROM alpine\nRUN ls -la' > Dockerfile.debug
   docker build -f Dockerfile.debug .
   ```

3. **Update the Dockerfile** to use explicit paths:
   ```dockerfile
   # Use absolute paths in COPY commands
   COPY ./package.json ./package-lock.json ./
   ```

4. **Check docker-compose.yml** for correct context:
   ```yaml
   services:
     app:
       build:
         context: .  # Verify this is correct
   ```

5. **Rebuild without cache**:
   ```bash
   docker-compose build --no-cache
   ```

## Advanced Solutions

### Using a Custom Build Script

Create a build script that prepares the environment before building:

```bash
#!/bin/bash
# build-docker.sh

# Verify package.json exists
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found!"
  exit 1
fi

# Create a temporary build directory
mkdir -p build_tmp
cp package.json package-lock.json build_tmp/
cp -r src build_tmp/
cp -r public build_tmp/
cp tsconfig.json build_tmp/
cp vite.config.ts build_tmp/

# Build from the temp directory
docker build -t app:latest -f Dockerfile build_tmp/

# Clean up
rm -rf build_tmp
```

### Frontend and Backend in Separate Directories

If your project structure has frontend and backend in separate directories, consider using separate Dockerfiles or a docker-compose.yml file that properly handles this structure:

```yaml
# docker-compose.yml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    # ...

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    # ...
```

## Conclusion

The most likely issue is that the Docker build context doesn't include the package.json and package-lock.json files in the expected location. By following the troubleshooting steps above, you should be able to identify and resolve the specific issue causing your Docker build to fail.

If none of these solutions work, consider restructuring your project to have a clearer separation between frontend and backend components, which can make Docker builds more straightforward.