@echo off

:: Check if docker-compose or docker compose is available
docker-compose version >nul 2>&1
if %ERRORLEVEL% == 0 (
    set COMPOSE_CMD=docker-compose
    goto start
)

docker compose version >nul 2>&1
if %ERRORLEVEL% == 0 (
    set COMPOSE_CMD=docker compose
    goto start
)

echo Error: Docker Compose is not installed. Please install it before running this script.
exit /b 1

:start
echo Starting the application...
%COMPOSE_CMD% -f EditConfigApp.yml down
%COMPOSE_CMD% -f EditConfigApp.yml up -d
echo Application started successfully!