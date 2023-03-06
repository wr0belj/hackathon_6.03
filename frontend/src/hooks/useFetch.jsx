import { useState } from "react";

function useFetch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getData = async function (url) {
    setIsLoading(true);
    try {
      const res = await fetch(url);

      if (res.ok) throw new Error("Something went wrong");

      const data = await res.json();
    } catch (err) {
      setError(err);
    }
    setIsLoading(false);
  };

  const sendData = async function (url, data, applyFn) {
    // console.log(JSON.stringify(data));
    setIsLoading(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Something went wrong");

      const receivedData = await res.json();

      applyFn(receivedData);
    } catch (err) {
      setError(err);
      console.error(err);
    }
    setIsLoading(false);
  };

  return { isLoading, error, getData, sendData };
}

export default useFetch;
