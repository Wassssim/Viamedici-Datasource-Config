# Getting Started with EditConfigApp

## Overview

This guide will help you run the EditConfigApp using Docker Compose. No technical knowledge is required!

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Docker** ([Download here](https://www.docker.com/get-started))

2. **Docker Compose**

- To verify if Docker Compose is installed, open a terminal and run:

  ```sh
  docker compose version
  ```

- If you see a version number, you already have Docker Compose installed.
- If this command fails, try:

  ```sh
  docker-compose version
  ```

- If this works, you have Docker Compose V1 (which is still fine).
- If both commands fail, you need to install Docker Compose manually:

  - **For older Docker versions (Docker Compose V1)** → [Download it here](https://github.com/docker/compose/releases)
  - **For the latest Docker Compose (V2)** → [Install Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Compose V2)

If you are using a non-GUI environment and need Docker Compose V2 without Docker Desktop, refer to the [official CLI installation guide](https://docs.docker.com/compose/install/).

## Steps to Run the Application

### 1. Download & Extract the Project

If you have received the application in a compressed format (such as `.zip` or `.rar`), extract it first.

### 2. Open a Terminal or Command Prompt

- On **Windows**, press `Win + R`, type `cmd`, and hit Enter.
- On **Mac/Linux**, open the Terminal application.

### 3. Navigate to the Project Directory

Use the following command to enter the project folder:

```sh
cd path/to/project
```

Replace `path/to/project` with the actual folder location.

### 4. Start the Application

#### **Windows Users:**

Run the following command in Command Prompt:

```sh
start.bat
```

#### **Mac/Linux Users:**

Run the following command in Terminal:

```sh
./start.sh
```

This will:

- Build and run the necessary containers using Docker Compose.
- Set up the backend and frontend.

### 5. Access the Application

Once started, the application should be accessible at:

```
http://localhost:PORT
```

Replace `PORT` with the actual port defined in `EditConfigApp.yml`.

## Stopping the Application

To stop the running application:

```sh
docker-compose down
```

If you need to restart, run the `start.bat` or `start.sh` script again.

## Troubleshooting

- If the application does not start, ensure Docker is running.
- If a port conflict occurs, update `EditConfigApp.yml` to use a different port.
- If you encounter permission issues on Mac/Linux, try:

```sh
chmod +x start.sh
./start.sh
```

## Advanced (Optional)

For those familiar with Docker, you can manually start the app using:

```sh
docker-compose up -d
```
