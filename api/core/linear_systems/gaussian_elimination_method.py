import json
import time

import numpy as np
from fastapi import HTTPException
from pydantic import BaseModel
from timeout_decorator import timeout

from api.constants import CALCULATION_TIMEOUT, CALCULATION_TIMEOUT_ERROR_MESSAGE


class GaussianEliminationMethodResponse(BaseModel):
    roots: list[float]
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


def gaussian_elimination_method_implementation(coefficient_matrix, constants):
    """
    Find the roots of a system of linear equations using Gaussian elimination method.

    :param coefficient_matrix:   Coefficient matrix.
    :param constants:   Constant vector.

    :return: A list of roots and iteration count.
    """

    coefficient_matrix = np.array(coefficient_matrix, dtype=float)
    constants = np.array(constants, dtype=float)
    n = len(coefficient_matrix)
    x = np.zeros(n)
    iteration_count = 0

    for j in range(n):
        if coefficient_matrix[j][j] == 0:
            raise ValueError(
                f"Division by zero error was encountered while running the Gaussian elimination method."
            )

        for k in range(j + 1, n):
            factor = coefficient_matrix[k][j] / coefficient_matrix[j][j]
            coefficient_matrix[k] -= factor * coefficient_matrix[j]
            constants[k] -= factor * constants[j]
            iteration_count += 1

    # Backward substitution
    for j in range(n - 1, -1, -1):
        x[j] = (
            constants[j] - np.dot(coefficient_matrix[j][j + 1 : n], x[j + 1 : n])
        ) / coefficient_matrix[j][j]
        iteration_count += 1

    return x, iteration_count


@timeout(
    CALCULATION_TIMEOUT,
    timeout_exception=TimeoutError,
)
def gaussian_elimination_method(coefficient_matrix: str, constants: str):
    """
    Find the roots of a system of linear equations using Gaussian elimination method.

    :param coefficient_matrix:   Coefficient matrix as a JSON array of arrays.
    :param constants:   Constant vector as a JSON array.

    :return: A list of roots and execution time.
    """

    try:
        # Parse JSON to array
        coefficient_matrix = json.loads(coefficient_matrix)
        constants = json.loads(constants)

        # Check if the coefficient matrix is square
        for row in coefficient_matrix:
            if len(row) != len(coefficient_matrix):
                raise ValueError("Coefficient matrix must be square.")

        # Check if the coefficient matrix and constant vector have the same number of rows
        if len(coefficient_matrix) != len(constants):
            raise ValueError(
                "Coefficient matrix and constant vector must have the same number of rows."
            )

        # Measure execution time
        start_time = time.time()

        # Gaussian elimination method implementation
        roots, iterations = gaussian_elimination_method_implementation(
            coefficient_matrix, constants
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
