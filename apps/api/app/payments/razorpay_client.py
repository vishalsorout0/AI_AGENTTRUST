from dotenv import load_dotenv
import os
import razorpay

load_dotenv()


class RazorpayClient:
    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET")

        if not self.key_id or not self.key_secret:
            self.client = None
        else:
            self.client = razorpay.Client(
                auth=(self.key_id, self.key_secret)
            )

    def is_configured(self):
        return self.client is not None

    def create_order(self, amount: float, currency: str = "INR"):
        if not self.client:
            raise RuntimeError(
                "Razorpay credentials are not configured"
            )

        order = self.client.order.create({
            "amount": int(amount * 100),
            "currency": currency,
            "receipt": f"agenttrust_{os.urandom(6).hex()}",
        })

        return order


razorpay_client = RazorpayClient()