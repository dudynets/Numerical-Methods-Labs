from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from websockets.exceptions import ConnectionClosedOK
import asyncio
from api.constants import CALCULATION_TIMEOUT_ERROR_MESSAGE
from core.functions.newtons_method import newtons_method, NewtonsMethodResponse
from core.functions.numerical_operation import (
    numerical_operation,
    NumericalOperationResponse,
)
from core.functions.simple_iteration import simple_iteration, SimpleIterationResponse
from core.helpers.validate_expression import validate_expression
from helpers.server_load import get_server_load

app = FastAPI(title="Numerical Methods Labs API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket(
    "/server_health",
    name="Server health",
)
async def __server_load(websocket: WebSocket):
    await websocket.accept()

    while True:
        try:
            await websocket.send_json(get_server_load().to_dict())
            await asyncio.sleep(3)
        except ConnectionClosedOK:
            break


@app.get(
    "/validate_expression",
    name="Validate expression",
    tags=["Helpers"],
    summary="Validates a mathematical expression",
    description=(
        "Validates a mathematical expression.\n"
        "Returns a boolean indicating whether the expression is valid or not."
    ),
)
async def __validate_expression(expression: str) -> bool:
    try:
        return validate_expression(expression)
    except TimeoutError:
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


@app.get(
    "/numerical_operations",
    name="Numerical operation",
    tags=["Functions"],
    summary="Computes a numerical operation",
    description=(
        "Computes a numerical operation.\n"
        "Supported operations: add, subtract, multiply, divide, power, mod, floor_divide.\n"
        "Returns the result of the operation."
    ),
)
async def __numerical_operation(
    a: int | float, b: int | float, op: str
) -> NumericalOperationResponse:
    try:
        return numerical_operation(a, b, op)
    except TimeoutError:
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


@app.get(
    "/newtons_method",
    name="Newtons method",
    tags=["Functions"],
    summary="Computes the root of a function using Newton's method",
    description=(
        "Computes the root of a function using Newton's method.\n"
        "The function and its derivative must be provided in string expression format.\n"
        "Tolerance and maximum number of iterations are optional.\n"
        "Returns the root, number of iterations, number of function calls, execution time and SVG plot."
    ),
)
async def __newtons_method(
    f_string: str, df_string: str, x0: float, tol: float = 1e-6, max_iter: int = 100
) -> NewtonsMethodResponse:
    try:
        return newtons_method(f_string, df_string, x0, tol, max_iter)
    except TimeoutError:
        raise HTTPException(status_code=400, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


@app.get(
    "/simple_iteration",
    name="Simple iteration",
    tags=["Functions"],
    summary="Computes the root of a function using simple iteration method",
    description=(
        "Computes the root of a function using simple iteration method.\n"
        "The function must be provided in string expression format.\n"
        "Tolerance and maximum number of iterations are optional.\n"
        "Returns the root, number of iterations, number of function calls, execution time and SVG plot."
    ),
)
async def __simple_iteration(
    f_string: str, x0: float, tol: float = 1e-6, max_iter: int = 100
) -> SimpleIterationResponse:
    try:
        return simple_iteration(f_string, x0, tol, max_iter)
    except TimeoutError:
        raise HTTPException(status_code=400, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Numerical Methods Labs API",
        version="0.1.0",
        summary="This project provides an API for numerical methods labs",
        description=(
            "- This project uses Python FastAPI to provide a REST API for the Numerical Methods Labs project.\n"
            "- Main libraries used:\n"
            "   - FastAPI - Python web framework.\n"
            "   - Uvicorn - ASGI server.\n"
            "   - NumPy - Python library for scientific computing.\n"
            "   - SymPy - Python library for symbolic mathematics.\n"
            "   - SciPy - Python library for scientific computing.\n"
            "   - Matplotlib - Python library for plotting.\n"
            "- Uses Poetry for dependency management."
        ),
        contact={
            "name": "Oleksandr Dudynets",
            "url": "https://dudynets.dev",
            "email": "hello@dudynets.dev",
        },
        license_info={
            "name": "MIT License",
            "url": "https://github.com/dudynets/Numerical-Methods-Labs/blob/main/LICENSE",
        },
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
