import asyncio

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from websockets.exceptions import ConnectionClosedOK

from api.constants import CALCULATION_TIMEOUT_ERROR_MESSAGE
from core.helpers.validate_expression import validate_expression
from core.interpolation.lagranges_interpolation_method import (
    lagranges_interpolation_method,
    LagrangesInterpolationMethodResponse,
)
from core.interpolation.newtons_interpolation_method import (
    NewtonsInterpolationMethodResponse,
    newtons_interpolation_method,
)
from core.linear_systems.fixed_point_iteration_system import (
    FixedPointIterationSystemMethodResponse,
    fixed_point_iteration_system_method,
)
from core.linear_systems.gaussian_elimination_method import (
    GaussianEliminationMethodResponse,
    gaussian_elimination_method,
)
from core.linear_systems.least_squares_method import (
    LeastSquaresMethodResponse,
    least_squares_method,
)
from core.non_linear.fixed_point_iteration_method import (
    fixed_point_iteration,
    FixedPointIterationMethodResponse,
)
from core.non_linear.newtons_method import newtons_method, NewtonsMethodResponse
from core.non_linear.secant_method import secant_method, SecantMethodResponse
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
    "/fixed_point_iteration_method",
    name="Fixed-point iteration",
    tags=["Functions"],
    summary="Computes the root of a function using fixed-point iteration method",
    description=(
        "Computes the root of a function using fixed-point iteration method.\n"
        "The function must be provided in string expression format.\n"
        "Tolerance and maximum number of iterations are optional.\n"
        "Returns the root, number of iterations, number of function calls, execution time and SVG plot."
    ),
)
async def __fixed_point_iteration(
    f_string: str, x0: float, tol: float = 1e-6, max_iter: int = 100
) -> FixedPointIterationMethodResponse:
    try:
        return fixed_point_iteration(f_string, x0, tol, max_iter)
    except TimeoutError:
        raise HTTPException(status_code=400, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


@app.get(
    "/secant_method",
    name="Secant method",
    tags=["Functions"],
    summary="Computes the root of a function using secant method",
    description=(
        "Computes the root of a function using secant method.\n"
        "The function must be provided in string expression format.\n"
        "Tolerance and maximum number of iterations are optional.\n"
        "Returns the root, number of iterations, execution time and SVG plot."
    ),
)
async def __secant_method(
    f_string: str, x0: float, x1: float, tol: float = 1e-6, max_iter: int = 100
) -> SecantMethodResponse:
    try:
        return secant_method(f_string, x0, x1, tol, max_iter)
    except TimeoutError:
        raise HTTPException(status_code=400, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


@app.get(
    "/gaussian_elimination_method",
    name="Gaussian elimination method",
    tags=["Functions"],
    summary="Computes the solution of a system of linear equations using Gaussian elimination method",
    description=(
        "Computes the solution of a system of linear equations using Gaussian elimination method.\n"
        "The system of linear equations must be provided in a matrix format.\n"
        "Returns the solution of the system of linear equations and the execution time."
    ),
)
async def __gaussian_elimination_method(
    coefficient_matrix: str, constants: str
) -> GaussianEliminationMethodResponse:
    try:
        return gaussian_elimination_method(coefficient_matrix, constants)
    except TimeoutError:
        raise HTTPException(status_code=400, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


@app.get(
    "/least_squares_method",
    name="Least squares method",
    tags=["Functions"],
    summary="Computes the solution of a system of linear equations using least squares method",
    description=(
        "Computes the solution of a system of linear equations using least squares method.\n"
        "The system of linear equations must be provided in a matrix format.\n"
        "Returns the solution of the system of linear equations and the execution time."
    ),
)
async def __least_squares_method(
    coefficient_matrix: str, constants: str
) -> LeastSquaresMethodResponse:
    try:
        return least_squares_method(coefficient_matrix, constants)
    except TimeoutError:
        raise HTTPException(status_code=400, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


@app.get(
    "/fixed_point_iteration_system_method",
    name="Fixed-point iteration",
    tags=["Functions"],
    summary="Computes the solution of a system of linear equations using fixed-point iteration method",
    description=(
        "Computes the solution of a system of linear equations using fixed-point iteration method.\n"
        "The system of linear equations must be provided in a matrix format.\n"
        "Returns the solution of the system of linear equations and the execution time."
    ),
)
async def __fixed_point_iteration_system_method(
    coefficient_matrix: str, constants: str, tol: float = 1e-6, max_iter: int = 100
) -> FixedPointIterationSystemMethodResponse:
    try:
        return fixed_point_iteration_system_method(
            coefficient_matrix, constants, tol, max_iter
        )
    except TimeoutError:
        raise HTTPException(status_code=400, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


@app.get(
    "/newtons_interpolation_method",
    name="Newton's interpolation method",
    tags=["Functions"],
    summary="Interpolate a polynomial using Newton's interpolation method",
    description=(
        "Interpolate a polynomial using Newton's interpolation method.\n"
        "The data points must be provided in a vector format.\n"
        "Returns the execution time and SVG plot."
    ),
)
async def __newtons_interpolation_method(
    x: str, y: str, number_of_points: int = 100
) -> NewtonsInterpolationMethodResponse:
    try:
        return newtons_interpolation_method(x, y, number_of_points)
    except TimeoutError:
        raise HTTPException(status_code=400, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


@app.get(
    "/lagranges_interpolation_method",
    name="Lagrange's interpolation method",
    tags=["Functions"],
    summary="Interpolate a polynomial using Lagrange's interpolation method",
    description=(
        "Interpolate a polynomial using Lagrange's interpolation method.\n"
        "The data points must be provided in a vector format.\n"
        "Returns the execution time and SVG plot."
    ),
)
async def __lagranges_interpolation_method(
    x: str, y: str, number_of_points: int = 100
) -> LagrangesInterpolationMethodResponse:
    try:
        return lagranges_interpolation_method(x, y, number_of_points)
    except TimeoutError:
        raise HTTPException(status_code=400, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Numerical Methods Labs API",
        version="1.0.0",
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
