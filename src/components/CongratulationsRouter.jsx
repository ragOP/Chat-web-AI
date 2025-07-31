import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Dummy components
const PageA = () => <div style={{ padding: 20 }}>✅ This is Page A (ChatbotResponse)</div>;
const PageB = () => <div style={{ padding: 20 }}>🚫 This is Page B (Not ChatbotResponse)</div>;

const CongratulationsRouter = () => {
  const location = useLocation();
  const [pageType, setPageType] = useState(null); // 'a' | 'b' | null
  const [loading, setLoading] = useState(true);

  const getQueryParam = (key) => {
    const params = new URLSearchParams(location.search);
    return params.get(key);
  };

  useEffect(() => {
    const fetchData = async () => {
      const fullName = getQueryParam("name");

      if (!fullName) {
        console.warn("⚠️ No name in URL");
        setPageType("b");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://benifit-gpt-be.onrender.com/check/model?fullName=${fullName}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.foundIn && data.foundIn.includes("ChatbotResponse")) {
          console.log("👉 Found in ChatbotResponse → Page A");
          setPageType("a");
        } else {
          console.log("👉 Not in ChatbotResponse → Page B");
          setPageType("b");
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        setPageType("b");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return pageType === "a" ? <PageA /> : <PageB />;
};

export default CongratulationsRouter;
