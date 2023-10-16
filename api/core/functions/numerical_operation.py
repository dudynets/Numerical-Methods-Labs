from fastapi import HTTPException
from pydantic import BaseModel
from timeout_decorator import timeout

from api.constants import (
    CALCULATION_TIMEOUT,
    CALCULATION_TIMEOUT_ERROR_MESSAGE,
)


class NumericalOperationResponse(BaseModel):
    result: float

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "result": 0.7390851332151607,
                }
            ]
        }
    }


@timeout(
    CALCULATION_TIMEOUT,
    timeout_exception=TimeoutError,
)
def numerical_operation(a: int | float, b: int | float, op: str):
    try:
        result = None

        if op == "add":
            result = a + b
        elif op == "subtract":
            result = a - b
        elif op == "multiply":
            result = a * b
        elif op == "divide":
            result = a / b
        elif op == "power":
            result = a**b
        elif op == "mod":
            result = a % b
        elif op == "floor_divide":
            result = a // b
        else:
            raise ValueError(
                f"Invalid operation: {op}. Allowed operations: add, subtract, multiply, divide, power, mod, floor_divide"
            )

        return {"result": result}
    except TimeoutError as te:
        raise HTTPException(status_code=408, detail=CALCULATION_TIMEOUT_ERROR_MESSAGE)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
