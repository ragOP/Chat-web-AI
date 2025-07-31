import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const CongratulationsRouter = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };

  useEffect(() => {
    const fetchData = async () => {
      const fullName = getQueryParam("name");

      if (!fullName) {
        console.log("❌ No name provided in query param");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `https://benifit-gpt-be.onrender.com/check/model?fullName=${fullName}`
        );

        const { foundIn } = res.data;

        if (foundIn.includes("ChatbotResponse")) {
          console.log("👉 Page A");
        } else {
          console.log("👉 Page B");
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>Check console for which page should load based on the name in URL.</p>
      )}
    </div>
  );
};

export default CongratulationsRouter;
