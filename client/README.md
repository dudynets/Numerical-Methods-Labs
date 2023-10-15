# Numerical Methods Labs Client

- This project uses Angular 16 to provide a web interface for the Numerical Methods Labs project.
- Main libraries used:
  - Angular Material - UI component library.
  - NGXS - State management library.
- Uses Yarn for dependency management.
- Generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.3.

## Usage

> **Note:** The following instructions are for running the client locally.


### Install dependencies

```bash
yarn install
```


### Run the client in development mode

```bash
yarn start
```

The client will be running at http://127.0.0.1:4200


### Build the client

```bash
yarn build
```

The build artifacts will be stored in the `dist/` directory.


## Docker

### Build the Docker image

```bash
docker build -t nml-client .
```

### Run the Docker container

Set `[LOCAL_PORT]` to the port you want to use locally.

```bash
docker run -d --name nml-client -p [LOCAL_PORT]:80 nml-client
```

The client will be running at http://localhost:[LOCAL_PORT]
