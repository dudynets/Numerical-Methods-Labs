import json
import time

import numpy as np
from fastapi import HTTPException
from pydantic import BaseModel
from timeout_decorator import timeout

from api.constants import CALCULATION_TIMEOUT, CALCULATION_TIMEOUT_ERROR_MESSAGE


class FixedPointIterationSystemMethodResponse(BaseModel):
    roots: list[float]
    iterations: int
    execution_time_ms: float

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "roots": [1.0, 2.0, 3.0],
                    "iterations": 4,
                    "execution_time_ms": 0.05000114440917969,
                }
            ]
        }
    }


def fixed_point_iteration_system_method_implementation(
    coefficient_matrix, constants, tol, max_iter
):
    """
    Find the roots of a system of linear equations using fixed-point iteration method.

    :param coefficient_matrix:   Coefficient matrix.
    :param constants:           Constant vector.
    :param tol:                 Tolerance for convergence.
    :param max_iter:            Maximum number of iterations.

    :return: A list of roots and iteration count.
    """

    A = np.array(coefficient_matrix, dtype=float)
    b = np.array(constants, dtype=float)

    x = np.zeros_like(b)

    for iteration in range(max_iter):
        x_new = np.linalg.inv(A) @ (b - (A @ x))

        if np.linalg.norm(x_new - x) < tol:
            return x_new, iteration + 1

        x = x_new

    return x, max_iter


@timeout(
    CALCULATION_TIMEOUT,
    timeout_exception=TimeoutError,
)
def fixed_point_iteration_system_method(
    coefficient_matrix: str, constants: str, tol: float = 1e-6, max_iter: int = 100
):
    """
    Find the roots of a system of linear equations using fixed-point iteration method.

    :param coefficient_matrix:   Coefficient matrix as a JSON array of arrays.
    :param constants:           Constant vector as a JSON array.
    :param tol:                 Tolerance for convergence.
    :param max_iter:            Maximum number of iterations.

    :return: A list of roots and execution time.
    """

    try:
        # Parse JSON to array
        coefficient_matrix = json.loads(coefficient_matrix)
        constants = json.loads(constants)

        # Check if the coefficient matrix and constant vector have the same number of rows
        if len(coefficient_matrix) != len(constants):
            raise ValueError(
                "Coefficient matrix and constant vector must have the same number of rows."
            )

        # Measure execution time
        start_time = time.time()

        # Fixed-point iteration method implementation
        roots, iterations = fixed_point_iteration_system_method_implementation(
            coefficient_matrix, constants, tol, max_iter
        )

        # Measure execution time
        execution_time_ms = (time.time() - start_time) * 1000

        # Return the results
        return {
            "roots": roots.tolist(),
            "iterations": iterations,
            "execution_time_ms": execution_time_ms,
        }

    except TimeoutError:
        # Handle timeout error and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)
    except Exception as e:
        # Handle any errors and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=422, detail=str(e))
