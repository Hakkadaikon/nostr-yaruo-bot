FROM ubuntu:20.04

# Set non interactive mode
ENV DEBIAN_FRONTEND=noninteractive

# Install curl
RUN apt update
RUN apt upgrade
RUN apt install -y curl

# Install gnupg
RUN apt install -y gnupg

# Add yarn gpg key
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt update

# Install node
RUN apt install -y npm

# Install node.js
RUN npm install -g n
RUN n 20.1.0

# Install yarn
RUN apt install -y yarn
