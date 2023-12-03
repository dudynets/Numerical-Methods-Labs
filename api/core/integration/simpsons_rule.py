import time

import numpy as np
import sympy as sp
from fastapi import HTTPException
from pydantic import BaseModel
from timeout_decorator import timeout

from api.constants import CALCULATION_TIMEOUT, CALCULATION_TIMEOUT_ERROR_MESSAGE


class SimpsonsRuleResponse(BaseModel):
    result: float
    execution_time_ms: float

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "result": 0.7390851332151607,
                    "execution_time_ms": 0.05000114440917969,
                }
            ]
        }
    }


@timeout(
    CALCULATION_TIMEOUT,
    timeout_exception=TimeoutError,
)
def simpsons_rule(
    f_string: str, a: float, b: float, number_of_interval_partitions: int = 100
):
    """
    Find the area under the curve of a function using Simpson's rule.

    :param f_string:                        String expression of the function f(x).
    :param a:                               Lower bound of the interval.
    :param b:                               Upper bound of the interval.
    :param number_of_interval_partitions:   Number of points to use for the Riemann sum.

    :return: A dictionary containing the result and execution time.
    """

    try:
        if number_of_interval_partitions < 1:
            raise ValueError("Number of interval partitions must be greater than 0.")

        if a >= b:
            raise ValueError("Upper bound must be greater than lower bound.")

        x = sp.symbols("x")

        # Parse LaTeX expressions to symbolic methods
        f = sp.sympify(f_string)

        # Convert to numpy methods for numerical calculations
        f_np = sp.lambdify(x, f, "numpy")

        # Measure execution time
        start_time = time.time()

        # Find the result
        h = (b - a) / number_of_interval_partitions
        x = np.linspace(a, b, number_of_interval_partitions + 1)
        y = f_np(x)
        result = h / 3 * (y[0] + 4 * np.sum(y[1:-1:2]) + 2 * np.sum(y[2:-1:2]) + y[-1])

        # Calculate execution time in milliseconds
        execution_time_ms = (time.time() - start_time) * 1000

        # Return the results
        return {
            "result": result,
            "execution_time_ms": execution_time_ms,
        }
    except TimeoutError:
        # Handle timeout error and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)
    except Exception as e:
        # Handle any errors and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=422, detail=str(e))
