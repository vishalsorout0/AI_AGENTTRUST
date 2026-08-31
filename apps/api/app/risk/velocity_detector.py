def calculate_velocity_risk(transaction_count: int = 0):
    if transaction_count <= 3:
        return 5

    if transaction_count <= 10:
        return 40

    return 90