# Seedfi backend

- A Money lending application

---

## Requirements

For development, you will only need Node.js (version 16 and above) and a node global package (npm) installed in your environment.

### Node

- #### Node installation on Windows

    Just go on [official Node.js website](https://nodejs.org/) and download the installer.
    Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

    You can install nodejs and npm easily with apt install, just run the following commands.

    ##### Installation Commands

        $ sudo apt install nodejs
        $ sudo apt install npm

- #### Other Operating Systems

    You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).
    If the installation was successful, you should be able to run the following command.

    ##### verification Commands

        $ node --version
        v16.8.0 (recommended for this project)
        $ npm --version
        8.19.2
    If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    ##### update Command

        $ npm install npm -g

---

## Seedfi Project Installation

    $ git clone https://github.com/enyata/seedfi-backend.git
    $ cd seedfi-backend
    $ npm install

---

## Configure app

create a  `.env` file to the root folder then add url to your db to connect your postgres DBs. 
An example of the structure of the `.env` is seen in `.env.example` file.

---

## Running migrations

run these scripts in your code terminal in the stated order to run up the sql migrations first then the seed migrations next

    $ npm run migrate:up
    $ npm run seed:up

---

## Setting up husky hooks

run these scripts in your code terminal in the stated order

    $ npx husky install (to add husky directory to the root)
    $ npx husky add .husky/pre-commit "npm run lint" (To ensure that before every git commit, the lint script runs)
    $ npx husky add .husky/pre-push "npm run test" (To ensure that before every git push, the test script runs)

---

## Start server locally

run this script in your code terminal

    $ npm run dev

---

## Running the scripts
All the different build steps are arranged via npm scripts.
Npm scripts basically allow us to call (and chain) terminal commands via npm.

| Npm Script                | Description                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `lint`                    | Runs eslint on project files. Can be invoked with `npm run lint`      |
| `dev`                     | starts the server in the local development environment. Can be invoked with `npm run dev` |
| `cron`                    | starts the server for the cron job for all the environments. Can be invoked with `npm run cron` |
| `prestart`                | Runs the up migration if any yet to be run when `npm run start` is invoked                  |
| `start`                   | starts the server in the staging or production environment. Can be invoked with `npm run start`                  |
| `pretest`                 | Runs a series of scripts that prepared the test DB for the test about to run when `npm run test` is invoked     |
| `test`                    | Runs tests using mocha. Can be invoked with `npm run test`      |
| `migrate:create`          | Runs when new migration files are needed. Can be invoked with `npm run migrate:create`      |
| `migrate:up`              | Runs when the added migration file needs to be implemented in the DB. Can be invoked with `npm run migrate:up`      |
| `migrate:down`            | Runs when the added migration file needs to be removed a step down in the DB. Can be invoked with `npm run migrate:down`      |
| `migrate:reset`           | Runs when the added migration files needs to be removed completely from the DB. Can be invoked with `npm run migrate:reset`      |
| `seed:create`             | Runs when new seed migration files are needed. Can be invoked with `npm run seed:create`      |
| `seed:up`                 | Runs when the added seed migration file needs to be implemented in the DB. Can be invoked with `npm run seed:up`      |
| `seed:down`               | Runs when the added seed migration file needs to be removed a step down in the DB. Can be invoked with `npm run seed:down`      |
| `seed:reset`              | Runs when the added seed migration files needs to be removed completely from the DB. Can be invoked with `npm run seed:reset`      |
| `migrate:up:test`         | Runs in the `pretest` script to add existing migrations to the test DB when `npm run test` is invoked      |
| `migrate:reset:test`      | Runs in the `pretest` script to drop all existing migrations from the test DB when `npm run test` is invoked      |
| `seed:up:test`            | Runs in the `pretest` script to add existing seed migrations to the test DB when `npm run test` is invoked      |
| `seed:reset:test`         | Runs in the `pretest` script to drop drop all existing seed migrations from the test DB when `npm run test` is invoked      |
| `build`                   | Runs to generate the build file into a dist folder using babel      |

---

## Postman API Documentation

https://documenter.getpostman.com/view/9438998/2s8YzWRfo6#c387b156-e461-4779-8a27-a12bdf31b8b2

___

## Technologies

- NodeJS
- ExpressJs
- Supertest
- Mocha
- Chai
- Postman
- PostgreSQL
- Google Firestore
- Google Firebase

---

## Copyright

Copyright (c) 2022 Enyata

---