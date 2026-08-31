def process_razorpay_event(event: dict):
    event_type = event.get("event")

    payload = event.get("payload", {})

    payment_entity = (
        payload
        .get("payment", {})
        .get("entity", {})
    )

    payment_id = payment_entity.get("id")
    order_id = payment_entity.get("order_id")
    amount = payment_entity.get("amount")
    status = payment_entity.get("status")

    if event_type == "payment.captured":
        return {
            "success": True,
            "event": event_type,
            "payment_id": payment_id,
            "order_id": order_id,
            "amount": amount,
            "status": "CAPTURED"
        }

    if event_type == "payment.failed":
        return {
            "success": True,
            "event": event_type,
            "payment_id": payment_id,
            "order_id": order_id,
            "amount": amount,
            "status": "FAILED"
        }

    return {
        "success": True,
        "event": event_type,
        "payment_id": payment_id,
        "order_id": order_id,
        "status": status or "UNKNOWN"
    }