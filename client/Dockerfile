# Create a new stage from the base node image
FROM node:18.18.0 as build

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN yarn

# Build application
RUN yarn build

# Create a new stage from the base nginx image
FROM nginx:latest

# Copy build files to nginx
COPY --from=build /app/dist/client /usr/share/nginx/html

# Expose port 80
EXPOSE 80
