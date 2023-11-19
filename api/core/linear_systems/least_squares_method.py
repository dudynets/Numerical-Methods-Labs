import json
import time

import numpy as np
from fastapi import HTTPException
from pydantic import BaseModel
from timeout_decorator import timeout

from api.constants import CALCULATION_TIMEOUT, CALCULATION_TIMEOUT_ERROR_MESSAGE


class LeastSquaresMethodResponse(BaseModel):
    roots: list[float]
    execution_time_ms: float

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "roots": [1.0, 2.0, 3.0],
                    "execution_time_ms": 0.05000114440917969,
                }
            ]
        }
    }


def least_squares_method_implementation(coefficient_matrix, constants):
    """
    Find the roots of a system of linear equations using least squares method.

    :param coefficient_matrix:   Coefficient matrix.
    :param constants:   Constant vector.

    :return: A list of roots.
    """

    A = np.array(coefficient_matrix, dtype=float)
    b = np.array(constants, dtype=float)

    AT = A.transpose()
    AtA = AT @ A
    AtB = AT @ b
    AtA_inv = np.linalg.inv(AtA)

    return AtA_inv @ AtB


@timeout(
    CALCULATION_TIMEOUT,
    timeout_exception=TimeoutError,
)
def least_squares_method(coefficient_matrix: str, constants: str):
    """
    Find the roots of a system of linear equations using least squares method.

    :param coefficient_matrix:   Coefficient matrix as a JSON array of arrays.
    :param constants:   Constant vector as a JSON array.

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

        # Least squares method implementation
        roots = least_squares_method_implementation(coefficient_matrix, constants)

        # Measure execution time
        execution_time_ms = (time.time() - start_time) * 1000

        # Return the results
        return {
            "roots": roots.tolist(),
            "execution_time_ms": execution_time_ms,
        }

    except TimeoutError:
        # Handle timeout error and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)
    except Exception as e:
        # Handle any errors and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=422, detail=str(e))
