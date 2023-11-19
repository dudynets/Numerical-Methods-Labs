import json
import time
from io import BytesIO

import matplotlib.pyplot as plt
import numpy as np
from fastapi import HTTPException
from pydantic import BaseModel
from timeout_decorator import timeout

from api.constants import CALCULATION_TIMEOUT, CALCULATION_TIMEOUT_ERROR_MESSAGE


class NewtonsInterpolationMethodResponse(BaseModel):
    execution_time_ms: float
    plot_svg: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "execution_time_ms": 0.05000114440917969,
                    "plot_svg": "<svg>...</svg>",
                }
            ]
        }
    }


def newtons_interpolation_method_implementation(x_values, y_values, number_of_points):
    """
    Interpolate a polynomial using Newton's interpolation method.

    :param x_values:            List of x values.
    :param y_values:            List of y values.
    :param number_of_points:    Number of points to plot.

    :return: x and y values of the interpolated polynomial
    """

    if len(x_values) != len(set(x_values)):
        raise ValueError("The x values must be unique.")

    def divided_differences(x, y):
        n = len(y)
        coefficients = np.zeros([n, n])
        coefficients[:, 0] = y

        for j in range(1, n):
            for i in range(n - j):
                coefficients[i][j] = (
                    coefficients[i + 1][j - 1] - coefficients[i][j - 1]
                ) / (x[i + j] - x[i])

        return coefficients

    def newton_interpolation(coefficients, x_data, x):
        n = len(x_data) - 1
        p = coefficients[n]
        for k in range(1, n + 1):
            p = coefficients[n - k] + (x - x_data[n - k]) * p
        return p

    coefficients = divided_differences(x_values, y_values)

    x_interpolation = np.linspace(min(x_values), max(x_values), number_of_points)
    y_interpolation = newton_interpolation(
        coefficients[0, :], x_values, x_interpolation
    )

    return x_interpolation, y_interpolation


@timeout(
    CALCULATION_TIMEOUT,
    timeout_exception=TimeoutError,
)
def newtons_interpolation_method(x: str, y: str, number_of_points: int = 100):
    """
    Interpolate a polynomial using Newton's interpolation method.

    :param x:                   List of x values as JSON string.
    :param y:                   List of y values as JSON string.
    :param number_of_points:    Number of points to plot.

    :return: A dictionary containing the execution time and SVG plot.
    """

    try:
        # Parse JSON to array
        x = json.loads(x)
        y = json.loads(y)

        # Check if the lists have the same length
        if len(x) != len(y):
            raise ValueError("The lists must have the same length.")

        # Measure execution time
        start_time = time.time()

        # Least squares method implementation
        x_interpolation, y_interpolation = newtons_interpolation_method_implementation(
            x, y, number_of_points
        )

        # Measure execution time
        execution_time_ms = (time.time() - start_time) * 1000

        # Create the plot
        plt.figure(figsize=(12, 12))

        # Plot the data and the regression line
        plt.plot(x_interpolation, y_interpolation)
        plt.plot(x, y, "bo")

        plt.axvline(0, color="black", linewidth=0.5)
        plt.axhline(0, color="black", linewidth=0.5)

        plt.grid(True, linestyle="--", alpha=0.7)
        plt.xlabel("x")
        plt.ylabel("y")

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
            "execution_time_ms": execution_time_ms,
            "plot_svg": svg_plot,
        }

    except TimeoutError:
        # Handle timeout error and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)
    except Exception as e:
        # Handle any errors and raise an HTTPException with a specific status code and detail message
        raise HTTPException(status_code=422, detail=str(e))
