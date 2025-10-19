import { useState, useEffect } from "react";
export function useApi(getData, deps = []) {
  const [data, setData] = useState(null);
  useEffect(() => { getData().then(setData); }, deps);
  return data;
}
