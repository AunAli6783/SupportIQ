import numexpr as ne
from langchain_core.tools import tool
from src.utils.logger import logger

@tool
def calculate(expression: str) -> str:
    """
    Safely evaluate arithmetic expressions for discount calculations, tax, total price, and refunds.
    Do NOT pass text or currency symbols (e.g. $, PKR). Pass raw expressions like '1200 * (1 - 0.15)' or '289999 * 0.15'.
    
    Args:
        expression: Mathematical expression string to evaluate (e.g. '500 * 0.20' or '289999 * (1 - 0.15)').
    """
    logger.info(f"Tool Exec: calculate(expression='{expression}')")
    
    # Clean expression
    cleaned_expr = (
        expression.replace("$", "")
        .replace("PKR", "")
        .replace("pkr", "")
        .replace(",", "")
        .replace("=", "")
        .strip()
    )

    # Disallow dangerous characters or Python keywords
    invalid_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_`[];{}")
    if any(c in invalid_chars for c in cleaned_expr):
        return "Calculator Error: Invalid expression containing unauthorized string characters."

    try:
        result = ne.evaluate(cleaned_expr).item()
        # Format clean integer or float
        if isinstance(result, float) and result.is_integer():
            result = int(result)
        return f"Calculation Result: {cleaned_expr} = {result}"
    except Exception as e:
        logger.error(f"Calculator evaluation failed for '{expression}': {str(e)}")
        return f"Calculator Error: Unable to evaluate expression '{expression}'."
