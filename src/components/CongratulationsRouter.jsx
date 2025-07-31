// src/pages/NoobPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

// Dummy PageA Component
const PageA = () => <div style={{ padding: 20 }}>✅ This is Page A (ChatbotResponse)</div>;

// Dummy PageB Component
const PageB = () => <div style={{ padding: 20 }}>🚫 This is Page B (Not ChatbotResponse)</div>;

const NoobPage = () => {
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
        const res = await axios.get(
          `https://benifit-gpt-be.onrender.com/check/model?fullName=${fullName}`
        );
        const { foundIn } = res.data;

        if (foundIn.includes("ChatbotResponse")) {
          console.log("👉 Rendering Page A");
          setPageType("a");
        } else {
          console.log("👉 Rendering Page B");
          setPageType("b");
        }
      } catch (err) {
        console.error("❌ API error:", err.message);
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

export default NoobPage;
