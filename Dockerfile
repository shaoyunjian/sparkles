# Base image: current LTS-slim version of Node.js
FROM node:lts-slim 

# Create app directory
WORKDIR /app

# Copy the files in the current directory (.) to the working directory in the image.
COPY . .

# Install app dependencies
RUN npm install

# Inform Docker that the container listens on port 8080
EXPOSE 8080

CMD [ "node", "server.js" ]