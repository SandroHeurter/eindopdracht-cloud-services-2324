# Eindopdracht-cloud-services-2324

## Docker

To start the project, navigate to the project directory in your terminal and run the following command:
`docker-compose up --force-recreate --build -d`


### Container Details

| Container Name | Internal Port | External Port | Network                | Dependencies        |
|----------------|---------------|---------------|-----------------------|---------------------|
| messagebroker  |               |               | photo-prestiges-net    |                     |
| backend        | 3000          | 3000          | photo-prestiges-net    | messagebroker       |
| auth-service   | 3020          | 3020          | auth-net, photo-prestiges-net | messagebroker, authdb |
| authdb         | 27100         | 27017         | auth-net               |                     |
| competition    | 3010          | 3010          | competition-net, photo-prestiges-net | messagebroker, competitiondb |
| competitiondb  | 27200         | 27017         | competition-net        |                     |


## Useful commands
Here are some useful commands for working with the containers in this project:

- Update and deploy the docker-compose: `docker compose up --force-recreate --build -d`
- npm install every folder: `npm run install-all`
