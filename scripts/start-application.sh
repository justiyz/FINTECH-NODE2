#!/bin/bash

# Define variables
CONTAINER_NAME='seedfi-backend-test'
IMAGE_URL="seedfi-backend-test:latest"
PORT=4500

# Restart the container
echo "Running Hook: start-application.sh"

# docker build
cd /home/ubuntu/seedfi-backend-test/seedfi-backend-api
sudo docker ps
sudo docker build -t seedfi-backend-test .

# Stop and Remove old Container
echo "Running Hook: Removing Old Container"
sudo docker stop "$CONTAINER_NAME" && sudo docker rm "$CONTAINER_NAME"

# Start new Container
echo "Running Hook: Starting the new Container"
sudo docker run --name "$CONTAINER_NAME" -d -p $PORT:4000 "$IMAGE_URL"

# Remove Dangling Images
echo "Running Hook: Removing Dangling Images!!!"
sudo docker image prune -f --filter "dangling=true"

echo "Running Hook: Deployment is successful !!!"