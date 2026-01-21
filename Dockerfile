# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install application dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
