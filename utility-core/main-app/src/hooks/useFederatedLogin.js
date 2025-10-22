/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useState } from "react";
export default function useFederatedLogin() {
  const [profile, setProfile] = useState(null);

  function login() {
    const win = window.open("http://localhost:5100/auth/google", "auth", "width=400,height=600");
    window.addEventListener("message", e => {
      if (e.data && e.data.id) setProfile(e.data);
    }, { once: true });
  }
  return [profile, login];
}
