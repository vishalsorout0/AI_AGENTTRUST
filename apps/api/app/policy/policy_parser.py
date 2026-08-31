def parse_policy(policy: dict):
    return {
        "name": policy.get("name"),
        "condition": policy.get("condition"),
        "action": policy.get("action"),
        "enabled": policy.get("enabled", True)
    }