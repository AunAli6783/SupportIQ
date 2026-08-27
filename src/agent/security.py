import re
from typing import Tuple
from src.utils.logger import logger

# Patterns indicative of prompt injection or jailbreak attempts
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"system\s+prompt",
    r"print\s+(api\s+key|credentials|env)",
    r"you\s+are\s+now\s+in\s+dan\s+mode",
    r"override\s+security",
    r"dump\s+(all\s+)?orders"
]

class SecurityGuard:
    @staticmethod
    def inspect_incoming_prompt(user_input: str) -> Tuple[bool, str]:
        """
        Scan incoming customer message for prompt injection attacks or jailbreak attempts.
        Returns (is_safe, message).
        """
        input_lower = user_input.lower()
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, input_lower):
                logger.warning(f"Security Alert: Blocked prompt injection pattern '{pattern}' in input: '{user_input}'")
                return False, "SECURITY DENIED: Malicious instruction or prompt override attempt detected."
        return True, "Passed security inspection"
