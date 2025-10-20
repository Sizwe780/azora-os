import axios from "axios";
import { useEffect, useState } from "react";
export function useAccount(user) {
  const [acct, setAcct] = useState({});
  useEffect(() => {
    if (user) axios.get("http://localhost:5200/api/openbanking/account/"+user).then(r=>setAcct(r.data));
  }, [user]);
  return acct;
}
export function transfer(from, to, amount) {
  return axios.post("http://localhost:5200/api/openbanking/transfer", { from, to, amount });
}
