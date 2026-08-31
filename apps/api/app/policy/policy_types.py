from dataclasses import dataclass


@dataclass
class PolicyResult:
    decision: str
    reason: str