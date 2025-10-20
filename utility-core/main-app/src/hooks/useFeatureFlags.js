import { useEffect, useState } from "react";
import axios from "axios";

export default function useFeatureFlags() {
  const [flags, setFlags] = useState({});
  useEffect(() => {
    axios.get("http://localhost:3400/flags").then(({data}) => setFlags(data));
  }, []);
  return flags;
}
