import sympy as sp
from fastapi import HTTPException
from timeout_decorator import timeout

from api.constants import CALCULATION_TIMEOUT, CALCULATION_TIMEOUT_ERROR_MESSAGE


@timeout(
    CALCULATION_TIMEOUT,
    timeout_exception=TimeoutError,
)
def validate_expression(expression: str) -> bool:
    """
    Validates a mathematical expression.

    Args:
        expression (str): string expression of the function f(x).

    Returns:
        bool: A boolean indicating whether the expression is valid or not.
    """
    try:
        x = sp.symbols("x")

        # Parse string expressions to symbolic functions
        f = sp.sympify(expression)

        sp.lambdify(x, f, "numpy")
    except TimeoutError:
        # Handle timeout error and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)
    except Exception as e:
        return False

    return True
