# HabiTapper.com
Repository for the source code of HabiTapper.com

## Under Developement
- Please note that the following project is under active developement and is subject to change

## Run and develop locally
1. clone the repository
2. navigate into it 
3. use `docker` to spin up a postgres instance for our local application to connect to
    - `docker run --name habitapper -e POSTGRES_USER=habitapper_user -e POSTGRES_PASSWORD=habitapper_pass -e POSTGRES_DB=habitapper -p 5432:5432 -v habitapper_data:/var/lib/postgresql/data -d postgres`
3. create a `.env` file that defines the following variables
    - email settings (neccessary, used for magic link user authentication)
        - `EMAIL_HOST`
        - `EMAIL_PORT`
        - `EMAIL_USERNAME`
        - `EMAIL_PASSWORD`
        - `EMAIL_FROM`
    - access key for HTTP request authorization that run CRON like actions (example: resetting user streak counts that have not been continued within 24 hours)
        - `APP_KEY`
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
    - runs a local website at `localhost:5555` that allows for easy viewing and interaction with the local postgres database the application uses
2. `curl -I --request POST --url "http://localhost:3000/api/tasks/processExpiredHabits" --header "Authorization: Bearer YOUR_APP_KEY_HERE"`
    - sends a HTTP POST request to the API route that resets habit streaks that are older then 24 hours. In production you should setup automatic pinging of this end point so user's habit streaks are reset after not being.
