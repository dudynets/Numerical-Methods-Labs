import json
import time

from fastapi import HTTPException
from pydantic import BaseModel
from timeout_decorator import timeout

from api.constants import CALCULATION_TIMEOUT, CALCULATION_TIMEOUT_ERROR_MESSAGE


class GaussianEliminationMethodResponse(BaseModel):
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


def gaussian_elimination_method_implementation(coefficient_matrix, constants):
    """
    Find the roots of a system of linear equations using Gaussian elimination method.

    :param coefficient_matrix:   Coefficient matrix.
    :param constants:   Constant vector.

    :return: A list of roots and iteration count.
    """

    A = coefficient_matrix
    b = constants

    iterations = 0

    n = len(A)
    for i in range(n):
        max_row = i
        for k in range(i + 1, n):
            if abs(A[k][i]) > abs(A[max_row][i]):
                max_row = k
            iterations += 1
        A[i], A[max_row] = A[max_row], A[i]
        b[i], b[max_row] = b[max_row], b[i]

        pivot = A[i][i]
        if pivot == 0:
            raise ValueError(
                "The system has no unique solution. Division by zero occurred in runtime."
            )

        for k in range(i, n):
            A[i][k] /= pivot
            iterations += 1
        b[i] /= pivot

        for k in range(n):
            if k != i:
                factor = A[k][i]
                for j in range(i, n):
                    A[k][j] -= factor * A[i][j]
                    iterations += 1
                b[k] -= factor * b[i]

        for i in range(n):
            for j in range(n):
                A[i][j] = round(A[i][j], 3)
                iterations += 1
            b[i] = round(b[i], 3)

    return b, iterations


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
            "roots": roots,
            "iterations": iterations,
            "execution_time_ms": execution_time_ms,
        }

    except TimeoutError:
        # Handle timeout error and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)
    except Exception as e:
        # Handle any errors and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=422, detail=str(e))
