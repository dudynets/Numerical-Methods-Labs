import time
from io import BytesIO

import matplotlib.pyplot as plt
import numpy as np
import sympy as sp
from fastapi import HTTPException
from pydantic import BaseModel
from timeout_decorator import timeout

from api.constants import CALCULATION_TIMEOUT, CALCULATION_TIMEOUT_ERROR_MESSAGE
from core.helpers.get_plot_limits import set_plot_limits_by_points


class FixedPointIterationMethodResponse(BaseModel):
    root: float
    iterations: int
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


def fixed_point_iteration_implementation(f, x0, tol, max_iter):
    """
    Find the root of the equation 0 = f(x) using the fixed-point iteration method.

    :param f:           The function representing 0 = f(x).
    :param x0:          Initial guess for the root.
    :param tol:         Tolerance for convergence.
    :param max_iter:    Maximum number of iterations.

    :return: The approximate root of the equation and the number of iterations required to converge.
    """
    x = x0
    iterations = 0
    steps = []

    for i in range(max_iter):
        x_next = x - f(x)  # Modify the iteration formula.
        if abs(x_next - x) < tol:
            return (
                float(x_next),
                iterations + 1,
                steps,
            )  # Converged to a root within the tolerance.
        x = x_next
        steps.append(x)
        iterations += 1

    return (
        float(x),
        max_iter,
    )  # Return the root and the number of iterations if the maximum number of iterations is reached.


@timeout(
    CALCULATION_TIMEOUT,
    timeout_exception=TimeoutError,
)
def fixed_point_iteration(
    f_string: str, x0: float, tol: float = 1e-6, max_iter: int = 100
):
    """
    Find the root of a function using fixed-point iteration method and create an SVG plot with details.

    :param f_string:    String expression of the function f(x).
    :param x0:          Initial guess for the root.
    :param tol:         Tolerance for convergence.
    :param max_iter:    Maximum number of iterations.

    :return: A dictionary containing the root, number of iterations, number of function calls, execution time and SVG plot.
    """

    try:
        if tol <= 0:
            raise ValueError("Tolerance must be positive.")

        if max_iter <= 0:
            raise ValueError("Maximum number of iterations must be greater than zero.")

        x = sp.symbols("x")

        # Parse string expression to symbolic methods
        f = sp.sympify(f_string)

        # Convert to numpy methods for numerical calculations
        f_np = sp.lambdify(x, f, "numpy")

        # Measure execution time
        start_time = time.time()

        # Simple iteration method implementation
        root, iterations, steps = fixed_point_iteration_implementation(
            f_np, x0, tol, max_iter
        )

        # Measure execution time
        execution_time_ms = (time.time() - start_time) * 1000

        # Generate x values for plotting
        root_to_x0_distance = abs(root - x0)
        x_values = np.linspace(
            root - (root_to_x0_distance * 2),
            root + (root_to_x0_distance * 2),
            10000,
        )
        if root_to_x0_distance == 0:
            x_values = np.linspace(
                root - 10,
                root + 10,
                10000,
            )

        # Add a zero to the x_values
        for i in range(len(x_values) - 1):
            if x_values[i] < 0 < x_values[i + 1] or x_values[i] > 0 > x_values[i + 1]:
                x_values = np.insert(x_values, i + 1, 0)
                break

        y_values = f_np(x_values)

        # Create the plot
        plt.figure(figsize=(12, 12))
        plt.margins(0)
        set_plot_limits_by_points(plt, [(root, root), (x0, x0)])

        plt.plot(x_values, y_values, label="f(x)")
        plt.axvline(0, color="black", linewidth=0.5)
        plt.axhline(0, color="black", linewidth=0.5)

        for step in steps:
            plt.scatter(
                step,
                0,
                color="green",
                marker="o",
                zorder=3,
                alpha=0.5,
            )

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

        # Set the plot limits
        set_plot_limits_by_points(plt, [(root, 0), (x0, 0)])

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
            "execution_time_ms": execution_time_ms,
            "plot_svg": svg_plot,
        }

    except TimeoutError:
        # Handle timeout error and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)
    except Exception as e:
        # Handle any errors and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=422, detail=str(e))
