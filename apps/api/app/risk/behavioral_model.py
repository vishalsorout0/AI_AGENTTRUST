def calculate_behavioral_risk(
    amount: float,
    max_transaction: float
):
    if max_transaction <= 0:
        return 100

    ratio = amount / max_transaction

    if ratio <= 0.5:
        return 10

    if ratio <= 1:
        return 20

    if ratio <= 2:
        return 60

    return 85