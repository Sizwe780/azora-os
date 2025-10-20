import axios from "axios";
const BASE_URL = process.env.REACT_APP_PAYMENT-STRIPE_URL || "http://localhost:3028";

export async function fetchPaymentStripe(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/payment-stripe`, payload);
  return r.data;
}
