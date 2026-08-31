def process_event(event: dict):
    event_type = event.get("event")

    if event_type == "payment.captured":
        return {
            "status": "PAID",
            "message": "Payment captured successfully"
        }

    if event_type == "payment.failed":
        return {
            "status": "FAILED",
            "message": "Payment failed"
        }

    if event_type == "order.paid":
        return {
            "status": "PAID",
            "message": "Order paid successfully"
        }

    return {
        "status": "IGNORED",
        "message": f"Unhandled event: {event_type}"
    }