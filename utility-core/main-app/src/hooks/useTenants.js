/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
import { useState, useEffect } from "react";
export function useTenants() {
  const [tenants, setTenants] = useState([]);
  useEffect(()=>{ axios.get("http://localhost:4900/api/tenants").then(r=>setTenants(r.data.tenants)); }, []);
  return tenants;
}
export async function createTenant(name) {
  return axios.post("http://localhost:4900/api/tenants", { name }).then(r=>r.data);
}
