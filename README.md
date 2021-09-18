# HabiTapper.com
Repository for the source code of HabiTapper.com

## Under Developement
- Please note that the following project is under active developement and is subject to change

## Run and develop locally
1. clone the repository
2. navigate into it 
3. use `docker` to spin up a postgres instance for our local application to connect to
    - `docker run --name habitapper-db -e POSTGRES_USER=habitapper_user -e POSTGRES_PASSWORD=habitapper_pass -e POSTGRES_DB=habitapper -p 5432:5432 -v habitapper_data:/var/lib/postgresql/data -d postgres`
3. create a `.env` file that defines the following variables
    - auth0 settings
        - `AUTH0_CLIENT_ID`
        - `AUTH0_CLIENT_SECRET`
        - `AUTH0_ISSUER`
    - email settings
        - `EMAIL_HOST`
        - `EMAIL_PORT`
        - `EMAIL_USERNAME`
        - `EMAIL_PASSWORD`
        - `EMAIL_FROM`
    - access key for HTTP request authorization that run CRON like actions (example: resetting user streak counts that have not been continued within 24 hours)
        - `APP_KEY=local_key`
    - next auth redirect url
        - `NEXTAUTH_URL=http://localhost:3000`
    - prisma (JavaScript ORM) db connection string
        - `DATABASE_URL=postgresql://habitapper_user:habitapper_pass@localhost:5432/habitapper`
5. run `yarn`
    - installs dependencies
5. run `yarn prisma migrate dev`
    - runs db migrations
6. run `yarn dev`
    - runs application with hot reloading enabled

## Useful commands during local development
1. `yarn prisma studio`
    - runs a local website at `localhost:5555` that allows for easy viewing and interaction with the local postgres database the application is using
2. `curl -I --request POST --url "http://localhost:3000/api/tasks/processExpiredHabits" --header "Authorization: Bearer local_key"`
    - sends a HTTP POST request to the API route that resets habit streaks that are older then 24 hours. In production you should setup automatic pinging of this end point so user's habit streaks are reset after not being.
3. `docker run --name pgadmin4 -e PGADMIN_DEFAULT_EMAIL=test@example.com -e PGADMIN_DEFAULT_PASSWORD=your_password -e PGADMIN_LISTEN_PORT=4000 -p 4000:4000 -v pgadmin_data:/var/lib/pgadmin -d dpage/pgadmin4`
    - runs a pgadmin4 container that you can configure to connect to your local (or remote) postgres database, useful if you want to look into your database more deeply then `yarn prisma studio` offers
        - **NOTE**: if you're trying to connect to your local database from pgadmin4 running in a container use the host name `host.docker.internal` instead of `localhost` during inital server connection configuration

## Deployment
- On a push to master vercel will pull, build, and deploy the newest version of the code to production
