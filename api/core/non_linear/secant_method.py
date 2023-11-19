import time
from io import BytesIO

import numpy as np
import sympy as sp
from fastapi import HTTPException
from matplotlib import pyplot as plt
from pydantic import BaseModel
from timeout_decorator import timeout

from api.constants import CALCULATION_TIMEOUT, CALCULATION_TIMEOUT_ERROR_MESSAGE
from core.helpers.get_plot_limits import set_plot_limits_by_points


class SecantMethodResponse(BaseModel):
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
                    "execution_time_ms": 0.05000114440917969,
                    "plot_svg": "<svg>...</svg>",
                }
            ]
        }
    }


def secant_method_implementation(f, x0, x1, tol, max_iter):
    """
    Find the root of a function using the Secant method.

    :param f:           The target function for which you want to find the root.
    :param x0:          Initial guess for the root.
    :param x1:          Initial guess for the root.
    :param tol:         Tolerance for convergence.
    :param max_iter:    Maximum number of iterations.

    :return: the approximate root of the function, the number of iterations required to converge, and the intermediate steps.
    """

    steps = []
    for i in range(max_iter):
        f_x0 = f(x0)
        f_x1 = f(x1)

        if abs(f_x1) < tol:
            return x1, i, steps

        if f_x1 - f_x0 == 0:
            # Avoid division by zero
            raise ValueError(
                f"Division by zero error was encountered while running the secant method. Iteration: {i}"
            )

        x_next = x1 - f_x1 * (x1 - x0) / (f_x1 - f_x0)
        steps.append(x_next)

        if abs(x_next - x1) < tol:
            return x_next, i, steps

        x0, x1 = x1, x_next

    raise ValueError(
        f"Maximum number of iterations ({max_iter}) was reached without convergence. Latest value: {x1}"
    )


@timeout(
    CALCULATION_TIMEOUT,
    timeout_exception=TimeoutError,
)
def secant_method(
    f_string: str, x0: float, x1: float, tol: float = 1e-6, max_iter: int = 100
):
    """
    Find the root of a function using simple iteration method and create an SVG plot with details.

    :param f_string:    String expression of the function f(x).
    :param x0:          Initial guess for the root.
    :param x1:          Initial guess for the root.
    :param tol:         Tolerance for convergence.
    :param max_iter:    Maximum number of iterations.

    :return: A dictionary containing the root, number of iterations, execution time and SVG plot.
    """

    try:
        if x0 >= x1:
            raise ValueError('The "b" must be greater than "a".')

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
        root, iterations, steps = secant_method_implementation(
            f_np, x0, x1, tol, max_iter
        )

        if not (x0 < root < x1 or x1 < root < x0):
            raise ValueError("The root is not in provided range.")

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
        set_plot_limits_by_points(plt, [(x0, 0), (x1, 0)])

        plt.plot(x_values, y_values, label="f(x)")
        plt.axvline(0, color="black", linewidth=0.5)
        plt.axhline(0, color="black", linewidth=0.5)

        plt.scatter(
            root,
            0,
            color="red",
            marker="o",
            label=f"Root ({str(round(root, 2)).rstrip('0').rstrip('.')})",
            zorder=4,
        )

        number_of_values_smaller_than_root = len([x for x in steps if x < root])
        number_of_values_greater_than_root = len([x for x in steps if x > root])

        if number_of_values_smaller_than_root > number_of_values_greater_than_root:
            steps = [x for x in steps if x < root]
        else:
            steps = [x for x in steps if x > root]

        end_point = x1 if steps[0] < steps[-1] else x0
        steps.insert(0, x0 if steps[0] < steps[-1] else x1)

        prev_step = None

        for step in steps:
            plt.scatter(
                step,
                0,
                color="green",
                marker="o",
                zorder=3,
                alpha=0.5,
            )

            plt.plot(
                [step, end_point],
                [f_np(step), f_np(end_point)],
                color="red",
                linestyle="-",
                linewidth=1,
                alpha=0.5,
            )

            if prev_step:
                plt.plot(
                    [prev_step, prev_step],
                    [f_np(prev_step), 0],
                    color="green",
                    linestyle="-",
                    linewidth=1,
                    alpha=0.5,
                )

            prev_step = step

        plt.axvline(
            x0,
            color="blue",
            linestyle="--",
            linewidth=1,
            alpha=0.5,
            label=f"a ({str(round(x0, 2)).rstrip('0').rstrip('.')})",
        )
        plt.axvline(
            x1,
            color="blue",
            linestyle="--",
            linewidth=1,
            alpha=0.5,
            label=f"b ({str(round(x1, 2)).rstrip('0').rstrip('.')})",
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
            "execution_time_ms": execution_time_ms,
            "plot_svg": svg_plot,
        }

    except TimeoutError:
        # Handle timeout error and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)
    except Exception as e:
        # Handle any errors and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=422, detail=str(e))
