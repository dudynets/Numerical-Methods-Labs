# Numerical Methods Labs API

- This project uses Python FastAPI to provide a REST API for the Numerical Methods Labs project.
- Main libraries used:
  - FastAPI - Python web framework.
  - Uvicorn - ASGI server.
  - NumPy - Python library for scientific computing.
  - SymPy - Python library for symbolic mathematics.
  - SciPy - Python library for scientific computing.
  - Matplotlib - Python library for plotting.
- Uses Poetry for dependency management.

## Usage

> **Note:** The following instructions are for running the API locally.


### Install dependencies

```bash
poetry install
```

### Start a shell within the virtual environment

```bash
poetry shell
```

### Run the server in development mode

```bash
uvicorn api.main:app --reload
```

The server will be running at http://127.0.0.1:8000

OpenAPI documentation will be available at http://127.0.0.1:8000/docs and http://127.0.0.1:8000/redoc


## Docker

### Build the Docker image

```bash
docker build -t nml-api .
```

### Run the Docker container

Set `[LOCAL_PORT]` to the port you want to use locally.

```bash
docker run -d --name nml-api -p [LOCAL_PORT]:8000 nml-api
```

The server will be running at http://localhost:[LOCAL_PORT]

OpenAPI documentation will be available at http://localhost:[LOCAL_PORT]/docs and http://localhost:[LOCAL_PORT]/redoc
