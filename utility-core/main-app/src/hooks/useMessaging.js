/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
import { useState, useEffect } from "react";
export function useMessages(user) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (user) axios.get(`http://localhost:4200/api/messages/${user}`).then(r=>setMessages(r.data.messages));
  }, [user]);
  return messages;
}
export function sendMessage(from, to, text) {
  return axios.post("http://localhost:4200/api/messages", { from, to, text });
}
