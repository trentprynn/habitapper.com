# HabiTapper.com
Repository for the source code of HabiTapper.com

## Under Development
- Please note that the following project is under active development and is subject to change

## Run and develop locally
1. clone the repository
2. navigate into it 
3. use `docker` to spin up a postgres instance for our local application to connect to
    - `docker run --name habitapper-db -e POSTGRES_USER=habitapper-user -e POSTGRES_PASSWORD=habitapper-pass -e POSTGRES_DB=habitapper -p 5432:5432 -v habitapper-data:/var/lib/postgresql/data -d postgres`
4. Create a `.env` file the defines the required runtime variables
    - `cp .env.sample .env`
5. run `yarn`
    - installs dependencies
6. run `yarn prisma migrate dev`
    - runs db migrations
7. run `yarn dev`
    - runs application with hot reloading enabled

## Useful commands during local development
1. `yarn prisma studio`
    - runs a local website at `localhost:5555` that allows for easy viewing and interaction with the local postgres database the application is using
2. `curl -I --request POST --url "http://localhost:3000/api/tasks/processExpiredHabits" --header "cron_key: local_key"`
    - sends a HTTP POST request to the API route that resets habit streaks that were not claimed. In production you should setup automatic pinging of this end point so user habit streaks are reset after not being claimed.
3. `docker run --name pgadmin4 -e PGADMIN_DEFAULT_EMAIL=test@example.com -e PGADMIN_DEFAULT_PASSWORD=your_password -e PGADMIN_LISTEN_PORT=4000 -p 4000:4000 -v pgadmin_data:/var/lib/pgadmin -d dpage/pgadmin4`
    - runs a pgadmin4 container that you can configure to connect to your local (or remote) postgres database, useful if you want to look into your database more deeply then `yarn prisma studio` offers
        - **NOTE**: if you're trying to connect to your local database from pgadmin4 running in a container use the host name `host.docker.internal` instead of `localhost` during initial server connection configuration

## Deployment
- On a push to master the website will be deployed automatically by Railway
- The following commands can be used to locally build and run the Dockerfile that will be deployed
    - build image: `docker build . -t habitapper.com`
    - create container: `docker run -d --name habitapper.com --env-file .env -p 3000:3000  habitapper.com`
    - stop container: `docker stop habitapper.com`
    - delete container: `docker rm habitapper.com`
    - delete image: `docker rmi habitapper.com`
