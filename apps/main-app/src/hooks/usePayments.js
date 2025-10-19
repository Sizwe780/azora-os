import axios from "axios";
export async function charge(user, amount) {
  return axios.post("http://localhost:5000/api/payments/charge", { user, amount }).then(r=>r.data);
}
export async function getPayments(user) {
  return axios.get(`http://localhost:5000/api/payments/${user}`).then(r=>r.data.payments);
}
