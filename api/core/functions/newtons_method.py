import time
from io import BytesIO

import matplotlib.pyplot as plt
import numpy as np
import sympy as sp
from fastapi import HTTPException
from pydantic import BaseModel
from scipy import optimize
from timeout_decorator import timeout

from api.constants import CALCULATION_TIMEOUT, CALCULATION_TIMEOUT_ERROR_MESSAGE
from core.helpers.get_plot_limits import set_plot_limits_by_points


class NewtonsMethodResponse(BaseModel):
    root: float
    iterations: int
    function_calls: int
    execution_time_ms: float
    plot_svg: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "root": 0.7390851332151607,
                    "iterations": 4,
                    "function_calls": 5,
                    "execution_time_ms": 0.05000114440917969,
                    "plot_svg": "<svg>...</svg>",
                }
            ]
        }
    }


@timeout(
    CALCULATION_TIMEOUT,
    timeout_exception=TimeoutError,
)
def newtons_method(
    f_string: str, df_string: str, x0: float, tol: float = 1e-6, max_iter: int = 100
):
    """
    Find the root of a function using Newton's method and create an SVG plot with details.

    :param f_string:    String expression of the function f(x).
    :param df_string:   String expression of the derivative of f(x).
    :param x0:          Initial guess for the root.
    :param tol:         Tolerance for convergence.
    :param max_iter:    Maximum number of iterations.

    :return: A dictionary containing the root, number of iterations, number of function calls, execution time and SVG plot.
    """

    try:
        x = sp.symbols("x")

        # Parse LaTeX expressions to symbolic functions
        f = sp.sympify(f_string)
        f_prime = sp.sympify(df_string)

        # Convert to numpy functions for numerical calculations
        f_np = sp.lambdify(x, f, "numpy")
        f_prime_np = sp.lambdify(x, f_prime, "numpy")

        # Measure execution time
        start_time = time.time()

        # Find the root using optimize.newton
        result = optimize.newton(
            f_np, x0, fprime=f_prime_np, tol=tol, maxiter=max_iter, full_output=True
        )

        root = result[0]
        iterations = result[1].iterations
        function_calls = result[1].function_calls

        # Calculate execution time in milliseconds
        execution_time_ms = (time.time() - start_time) * 1000

        # Generate x values for plotting
        root_to_x0_distance = abs(root - x0)
        x_values = np.linspace(
            root - (root_to_x0_distance * 2),
            root + (root_to_x0_distance * 2),
            400,
        )
        y_values = f_np(x_values)
        tangent = f_prime_np(root) * (x_values - root) + f_np(root)

        # Create the plot
        plt.figure(figsize=(12, 12))
        plt.margins(0)
        set_plot_limits_by_points(plt, [(root, 0), (x0, 0)])

        plt.plot(x_values, y_values, label="f(x)")
        plt.plot(x_values, tangent, label="Tangent to f(x)", linestyle="--")
        plt.axvline(0, color="black", linewidth=0.5)
        plt.axhline(0, color="black", linewidth=0.5)

        plt.scatter(
            root,
            0,
            color="red",
            marker="o",
            label=f"Root ({str(round(root, 2)).rstrip('0').rstrip('.')})",
            zorder=3,
        )
        plt.scatter(
            x0,
            0,
            color="green",
            marker="x",
            label=f"Initial guess for the root ({str(round(x0, 2)).rstrip('0').rstrip('.')})",
            zorder=3,
        )
        plt.grid(True, linestyle="--", alpha=0.7)
        plt.xlabel("x")
        plt.ylabel("y")
        plt.legend()

        # Save the plot to an SVG file with a transparent background
        svg_buffer = BytesIO()
        plt.savefig(
            svg_buffer,
            format="svg",
            transparent=True,
            bbox_inches="tight",
            pad_inches=0,
        )
        svg_buffer.seek(0)
        svg_plot = svg_buffer.read().decode("utf-8")

        # Close the plot
        plt.close()

        # Return the results
        return {
            "root": root,
            "iterations": iterations,
            "function_calls": function_calls,
            "execution_time_ms": execution_time_ms,
            "plot_svg": svg_plot,
        }
    except TimeoutError:
        # Handle timeout error and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)
    except Exception as e:
        # Handle any errors and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=422, detail=str(e))
