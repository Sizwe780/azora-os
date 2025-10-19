import axios from "axios";
import { useEffect, useState } from "react";
export function useUserProfile(userId) {
  const [profile, setProfile] = useState({});
  useEffect(() => {
    if (userId) axios.get(`http://localhost:4100/api/personalize/${userId}`).then(r=>setProfile(r.data.profile));
  }, [userId]);
  return profile;
}
export function setUserPreferences(userId, preferences) {
  return axios.post("http://localhost:4100/api/personalize", { userId, preferences });
}
