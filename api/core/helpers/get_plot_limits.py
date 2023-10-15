import math


def set_plot_limits_by_points(plt, points):
    if not points:
        return None  # Handle the case of an empty list

    # Initialize sum of x and y coordinates to 0
    sum_x = 0
    sum_y = 0

    # Calculate the sum of all x and y coordinates
    for point in points:
        sum_x += point[0]
        sum_y += point[1]

    # Calculate the average x and y coordinates
    center_x = sum_x / len(points)
    center_y = sum_y / len(points)

    # Calculate the distance from the center to each point and find the minimum distance
    min_distance = min(math.dist((center_x, center_y), point) for point in points)

    # Calculate the plot limits with the margin
    x_min = center_x - min_distance * 2
    x_max = center_x + min_distance * 2
    y_min = center_y - min_distance * 2
    y_max = center_y + min_distance * 2

    plt.xlim(x_min, x_max)
    plt.ylim(y_min, y_max)
