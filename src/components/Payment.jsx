import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import InfinityLoader from "./InfinityLoader";
import CongratulationsPage from "./CongoPage";
import botAvatar from "../assets/pic-DztGI3xK.png";
import nameAudio from "../assets/Great Let-s start with y 1.wav";
import ageAudio from "../assets/Okay and whats your age 1.wav";
import zipcodeAudio from "../assets/Nice and what-s your zip 1.wav";
import emailAudio from "../assets/So far so good may i kno 1.wav";
import medicareAudio from "../assets/Thank you Now are you o 3.wav";
import alzheimersAudio from "../assets/Do you have any of the me 1.wav";
import homeAudio from "../assets/Okay next do you own you 2.wav";
import have from "../assets/abc.wav";
import accidentAudio from "../assets/Have you faced any motor 1.wav";
import childAudio from "../assets/Do you have any children 2.wav";
import debtAudio from "../assets/Okay and do you have a c 4.wav";
import exerciseAudio from "../assets/Do you exercise at least 2.wav";
import firstquestion from "../assets/Congratulations on taking 2 (1).wav";
import secondquestion from "../assets/Let-s just get to know yo 2.wav";
import thirdquestion from "../assets/Tap the button below and 2.wav";
import center from "../assets/center.png";
import PaymentConfirmation from "./PaymentConfirmation";
import FaqAccordion from "./Faq";

const TAGS = {
  medicare: "is_md",
  ssdi: "is_ssdi",
  auto: "is_auto",
  mva: "is_mva",
  debt: "is_debt",
  mortgage: "is_rvm",
};

const questions = [
  {
    id: 1,
    text: "What's your full name?",
    type: "text",
    keyType: "alphabet",
    audio: nameAudio,
  },
  {
    id: 2,
    text: "Okay, what is your age today?",
    type: "text",
    keyType: "numeric",
    audio: ageAudio,
  },
  {
    id: 3,
    text: "Nice, and what's your zip code?",
    type: "text",
    keyType: "numeric",
    audio: zipcodeAudio,
  },
  {
    id: 4,
    text: "So far so good!",
    type: "info",
    audio: emailAudio,
  },
  {
    id: 5,
    text: "May I know your email?",
    type: "text",
    keyType: "alphabet",
  },
  {
    id: 6,
    text: "Thank you",
    type: "info",
    audio: medicareAudio,
  },
  {
    id: 7,
    text: "Now, are you on medicare?",
    type: "choice",
    options: ["Yes", "No"],
    tag: TAGS.medicare,
  },
  {
    id: 8,
    text: "Do you have any of the mentioned health conditions?",
    type: "choice",
    options: ["Alzheimers", "Diabetes", "Hypertension", "Arthritis", "No"],
    tag: TAGS.ssdi,
    audio: alzheimersAudio,
  },
  {
    id: 9,
    text: "Do you own your home or rent?",
    type: "choice",
    options: ["I Own", "I Rent"],
    tag: TAGS.mortgage,
    audio: homeAudio,
  },
  {
    id: 10,
    text: "Great, We're almost there!",
    type: "info",
    audio: have,
  },
  {
    id: 11,
    text: "Do you have a car that you drive at least once a week?",
    type: "choice",
    options: ["Yes", "No"],
    tag: TAGS.auto,
  },
  {
    id: 12,
    text: "Have you faced any motor vehicle accidents in the last 2 years?",
    type: "choice",
    options: ["Yes", "No"],
    tag: TAGS.mva,
    audio: accidentAudio,
  },
  {
    id: 13,
    text: "Alright, we're almost done.",
    type: "info",
    audio: childAudio,
  },
  {
    id: 14,
    text: "Do you have any children between the age of 18-64?",
    type: "choice",
    options: ["Yes", "No"],
  },
  {
    id: 15,
    text: "Okay, and do you have a credit card debt of $10,000 or more?",
    type: "choice",
    options: ["Yes", "No"],
    tag: TAGS.debt,
    audio: debtAudio,
  },
  {
    id: 16,
    text: "I got it, Just one last question!",
    type: "info",
    audio: exerciseAudio,
  },
  {
    id: 17,
    text: "Do you exercise at least once a week?",
    type: "choice",
    options: ["Yes", "No"],
  },
];

export default function Payment() {
  const [startChat, setStartChat] = useState(false);
  const [activatingAiLoder, setActivatingAiLoder] = useState(false);
  const [chat, setChat] = useState([]);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [finalmessage, setFinalMessage] = useState(false);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const chatBoxRef = useRef(null);
  const audioRef = useRef(null);

  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (chatBoxRef.current) {
      setTimeout(() => {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [chat, typing]);

  const playMessageAudio = (audioUrl, onEnded = null) => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current
        .play()
        .then(() => {
          if (onEnded) {
            audioRef.current.onended = onEnded;
          } else {
            audioRef.current.onended = null;
          }
        })
        .catch((err) => {
          console.error("Audio playback failed:", err);
        });
    }
  };

  const simulateBotTyping = (question, showTyping = true) => {
    if (showTyping) setTyping(true);

    setTimeout(
      () => {
        setChat((prev) => [
          ...prev,
          {
            id: question.id,
            sender: "bot",
            text: question.text,
            type: question.type,
            options: question.options,
            audio: question.audio,
          },
        ]);
        playMessageAudio(question.audio);
        setTyping(false);
      },
      showTyping ? 1000 : 10
    );
  };

  const handleSend = (response) => {
    const currentQuestion = questions[step];

    if (currentQuestion.id === 3 && !validatePincode(response)) {
      alert("Please enter a valid pincode");
      return;
    }
    if (currentQuestion.id === 5 && !validateEmail(response)) {
      alert("Please enter a valid email");
      return;
    }

    if (currentQuestion.id === 5) {
      try {
        const emailPayload = {
          email: response,
        };
        setEmail(response);

        fetch("https://benifit-gpt-be.onrender.com/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("✅ Email API call successful:", data);
          })
          .catch((err) => {
            console.error("❌ Error calling email API:", err);
          });
      } catch (error) {
        console.error("❌ Error in email API call:", error);
      }
    }

    if (currentQuestion.tag) {
      let shouldTag = false;
      if (currentQuestion.id === 7 && (response === "Yes" || response === "No"))
        shouldTag = true;
      if (currentQuestion.id === 8 && response !== "No") shouldTag = true;
      if (currentQuestion.id === 9 && response === "I Own") shouldTag = true;
      if (currentQuestion.id === 11 && response === "Yes") shouldTag = true;
      if (currentQuestion.id === 12 && response === "Yes") shouldTag = true;
      if (currentQuestion.id === 15 && response === "Yes") shouldTag = true;
      if (shouldTag && !tags.includes(currentQuestion.tag)) {
        setTags((prev) => [...prev, currentQuestion.tag]);
      }
    }

    switch (currentQuestion.id) {
      case 1:
        setName(response);
        break;
      default:
        break;
    }

    const updatedAnswers = {
      ...answers,
      [currentQuestion.text]: response,
    };
    setAnswers(updatedAnswers);

    const updatedChat = [
      ...chat,
      { id: chat.length + 1, sender: "user", text: response },
    ];
    setChat(updatedChat);
    setInput("");

    let nextStep = step + 1;

    if (
      nextStep < questions.length &&
      questions[nextStep].type === "info" &&
      nextStep + 1 < questions.length
    ) {
      const infoMsg = questions[nextStep];
      const realMsg = questions[nextStep + 1];

      setChat((prev) => [
        ...prev,
        {
          id: infoMsg.id,
          sender: "bot",
          text: infoMsg.text,
          type: "info",
          audio: infoMsg.audio,
        },
        {
          id: realMsg.id,
          sender: "bot",
          text: realMsg.text,
          type: realMsg.type,
          options: realMsg.options,
          audio: realMsg.audio,
        },
      ]);

      setStep(nextStep + 1);

      playMessageAudio(infoMsg.audio, () => {
        playMessageAudio(realMsg.audio);
      });

      return;
    }

    if (nextStep < questions.length) {
      setStep(nextStep);
      simulateBotTyping(questions[nextStep]);
    } else {
      setFinalMessage(true);
      handleFinalAnswers(updatedAnswers, tags);
    }
  };

  const handleChoiceClick = (choice) => {
    if (
      choice === "Lets Start" &&
      step === 0 &&
      chat.some((m) => m.text.includes("Tap the button"))
    ) {
      setChat([]);
      setTimeout(() => {
        simulateBotTyping(questions[0], false);
      }, 1000);
      return;
    }

    handleSend(choice);
  };

  const renderUserInput = () => {
    if (typing || step >= questions.length) return null;

    const current = questions[step];
    if (current.type === "text") {
      return (
        <div className="mt-3 w-full flex flex-col items-end">
          <div className="flex gap-2 mt-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              className="flex-grow rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-base"
              placeholder="Type your message..."
              style={{ fontSize: "16px" }}
            />
            <button
              onClick={() => handleSend(input)}
              className="bg-[#005e54] text-black p-5 rounded-full transition duration-150"
              aria-label="Send"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleFinalAnswers = async (allAnswers, tagArray) => {
    const tempUserId =
      allAnswers["What's your full name?"].slice(0, 3).toUpperCase() +
      Date.now().toString();
    setUserId(tempUserId);
    const payload = {
      user_id: tempUserId,
      fullName: allAnswers["What's your full name?"],
      age: allAnswers["Okay, what is your age today?"],
      zipcode: allAnswers["Nice, and what's your zip code?"],
      email: allAnswers["May I know your email?"],
      tags: tagArray || tags,
      origin: "3",
    };
    try {
      const res = await fetch(
        "https://benifit-gpt-be.onrender.com/response/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      console.log("✅ Successfully submitted:", data);
    } catch (err) {
      console.error("❌ Error submitting chatbot answers:", err);
    }
  };

  const handleStartAI = () => {
    setActivatingAiLoder(true);

    setTimeout(() => {
      setActivatingAiLoder(false);
      setStartChat(true);

      const initialMessages = [
        {
          id: 1,
          sender: "bot",
          text: "Congratulations on taking the first step toward claiming the benefits you rightfully deserve!",
          audio: firstquestion,
        },
        {
          id: 2,
          sender: "bot",
          text: "Let's just get to know you a little better, so I can help unlock all the benefits, subsidies, and allowances you might qualify for.",
          audio: secondquestion,
        },
        {
          id: 3,
          sender: "bot",
          text: "Tap the button below and we'll get started — it only takes a minute.",
          type: "choice",
          options: ["Lets Start"],
          audio: thirdquestion,
        },
      ];

      let delays = [500, 6500, 14000];
      initialMessages.forEach((msg, index) => {
        setTimeout(() => {
          setChat((prev) => {
            const newChat = [...prev, msg];
            playMessageAudio(msg.audio);
            return newChat;
          });
        }, delays[index]);
      });
    }, 3000);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePincode = (pincode) => {
    const pinRegex = /^\d{5,6}$/;
    return pinRegex.test(pincode);
  };
  return (
    <>
      {!finalmessage ? (
        <>
          <audio playsInline ref={audioRef} style={{ display: "none" }} />
          <div>
            <div className="w-full bg-black text-white py-1 flex justify-center items-center space-x-2">
              <img
                src={center}
                alt="logo"
                className="w-[60%] h-[55px] object-contain"
              />
            </div>

            <div
              className="w-full text-white text-center font-semibold italic py-2 rounded-b-full text-sm"
              style={{ backgroundColor: "#005e54" }}
            >
              22,578 Seniors Helped In Last 24 Hours!
            </div>
          </div>
          <div
            className="min-h-screen p-4 flex flex-col items-center"
            style={{ backgroundColor: "rgb(246,246,243)" }}
          >
            <div className="w-full max-w-md bg-grey h-[80vh] px-4 py-1 space-y-2">
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center px-6 py-2 bg-black text-white uppercase rounded-full">
                  <h2 className="text-sm font-bold whitespace-nowrap -mt-1">
                    100% FREE, NO refund COSTS!
                  </h2>
                </div>
              </div>
              <div className="flex-grow flex flex-col justify-between h-full">
                {startChat ? (
                  <div
                    ref={chatBoxRef}
                    className="max-h-[100vh] overflow-y-auto p-2 space-y-2 flex flex-col scrollbar-hide [&::-webkit-scrollbar]:hidden"
                  >
                    <AnimatePresence initial={false}>
                      {chat.map((msg, idx) => (
                        <motion.div
                          key={msg.id + "-" + idx}
                          className={`flex flex-col ${
                            msg.sender === "bot" ? "items-start" : "items-end"
                          } mb-4`}
                          initial={{
                            opacity: 0,
                            y: 20,
                            scale: 0.95,
                            x: msg.sender === "bot" ? -20 : 20,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.95,
                            y: 10,
                            x: msg.sender === "bot" ? -20 : 20,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 25,
                            mass: 1,
                            duration: 0.8,
                          }}
                        >
                          <div className="flex h-full">
                            {msg.sender === "bot" &&
                              idx === chat.length - 1 && (
                                <motion.div
                                  className="flex flex-col justify-end mr-2"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 120,
                                    damping: 25,
                                    delay: 0.2,
                                    duration: 0.8,
                                  }}
                                >
                                  <div className="w-8 h-8 flex items-center justify-center">
                                    <motion.img
                                      className="w-full h-full rounded-full shadow-lg"
                                      src={botAvatar}
                                      alt="Bot Avatar"
                                      initial={{ scale: 0.5 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 120,
                                        damping: 25,
                                        delay: 0.3,
                                        duration: 0.8,
                                      }}
                                    />
                                  </div>
                                </motion.div>
                              )}
                            <motion.div
                              className={`relative max-w-xs ${
                                msg.sender === "bot"
                                  ? idx === chat.length - 1
                                    ? "ml-1"
                                    : "ml-10"
                                  : "mr-1"
                              }`}
                              initial={{ scale: 0.95 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 120,
                                damping: 25,
                                duration: 0.8,
                              }}
                            >
                              <div
                                className={`p-3 rounded-2xl shadow-sm ${
                                  msg.sender === "bot"
                                    ? "bg-white text-black rounded-bl-none"
                                    : "bg-[#005e54] text-white rounded-br-none"
                                }`}
                                style={{
                                  transform: "translateZ(0)",
                                  backfaceVisibility: "hidden",
                                  whiteSpace: "pre-line",
                                }}
                              >
                                {msg.text}
                              </div>

                              {msg.sender === "bot" && (
                                <motion.svg
                                  viewBox="120 85 60 60"
                                  className={`absolute -bottom-[1.6px] w-[20px] h-[20px] ${
                                    msg.sender === "bot"
                                      ? "left-[-15px]"
                                      : "right-[-15px] scale-x-[-1]"
                                  }`}
                                  fill={
                                    msg.sender === "bot" ? "#ffffff" : "#005e54"
                                  }
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 120,
                                    damping: 25,
                                    delay: 0.2,
                                    duration: 0.8,
                                  }}
                                >
                                  <path d="M 167 92 V 92 V 142 H 130 C 155 134 163 123 167 93" />
                                </motion.svg>
                              )}
                            </motion.div>
                          </div>

                          {msg.sender === "bot" && msg.type === "choice" && (
                            <motion.div
                              className="flex flex-wrap gap-2 mt-3 ml-10"
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 120,
                                damping: 25,
                                mass: 1,
                                delay: 0.4,
                                duration: 0.8,
                              }}
                            >
                              {msg.options.map((opt, i) => (
                                <motion.button
                                  key={i}
                                  onClick={() => handleChoiceClick(opt)}
                                  className="text-white font-bold px-6 py-4 rounded-xl bg-[#005e54] hover:bg-[#004a43] transition-colors duration-300"
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 120,
                                    damping: 25,
                                    mass: 1,
                                    delay: 0.4 + i * 0.15,
                                    duration: 0.8,
                                  }}
                                >
                                  {opt}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}

                          {idx === chat.length - 1 &&
                            msg.sender === "bot" &&
                            msg.type === "text" &&
                            renderUserInput()}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {typing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 120,
                          damping: 25,
                          mass: 1,
                          duration: 0.8,
                        }}
                        className="flex items-center gap-2 mt-2"
                      >
                        <motion.img
                          src={botAvatar}
                          alt="Bot"
                          className="w-8 h-8 rounded-full shadow-lg"
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 25,
                            duration: 0.8,
                          }}
                        />
                        <motion.div
                          initial={{ scale: 0.95, x: -10 }}
                          animate={{ scale: 1, x: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 25,
                            duration: 0.8,
                          }}
                          className="max-w-xs p-3 rounded-2xl shadow-sm bg-white text-gray-800 flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <h1 className="font-bold text-3xl text-center text-black">
                      Seniors, Get Your Benefits Eligibility Check in Just 60 Seconds!
                    </h1>
                    <div className="flex justify-center items-center mt-6  ml-8 px-0 text-md font-semibold text-gray-600">
                      <div className="space-y-2 flex flex-col items-start space-x-2">
                        <div className="flex items-start space-x-2">
                          <div className="w-5 h-5 mt-0.5 flex items-center justify-center rounded bg-[#005e54] text-white">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span>Over 2M+ Seniors Helped Till Date.</span>
                        </div>

                        <div className="flex items-start space-x-2">
                          <div className="w-5 h-5 mt-0.5 flex items-center justify-center rounded bg-[#005e54] text-white">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span>Just $1 (100% Refund Guarantee)</span>
                        </div>

                        <div className="flex items-start space-x-2">
                          <div className="w-5 h-5 mt-0.5 flex items-center justify-center rounded bg-[#005e54] text-white">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span>90% Of Users Qualify for Benefits $2500+</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center mt-6">
                      {activatingAiLoder ? (
                        <div className="flex items-center justify-center my-3">
                          <InfinityLoader />
                        </div>
                      ) : (
              
  <button
  onClick={handleStartAI}
  className="relative overflow-hidden text-white text-3xl font-semibold px-10 py-4 rounded-full bg-[#005e54] hover:opacity-95 transition duration-300 shadow-xl flex items-center gap-3"
>
  {/* Emoji Hand */}
  <span className="animate-wave text-4xl origin-[70%_70%]">👋</span>

  {/* Button Text */}
  <span className="relative z-10 flex items-center gap-2">
    START NOW <ChevronRight className="w-8 h-8" />
  </span>

  {/* Shimmer overlay */}
  <span
    className="absolute inset-0 animate-betterShimmer pointer-events-none"
    style={{
      background:
        "linear-gradient(130deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 70%)",
      zIndex: 1,
      maskImage:
        "linear-gradient(to right, transparent 0%, black 40%, black 60%, transparent 100%)",
      WebkitMaskImage:
        "linear-gradient(to right, transparent 0%, black 40%, black 60%, transparent 100%)",
    }}
  />

  <style jsx>{`
    @keyframes betterShimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    .animate-betterShimmer {
      animation: betterShimmer 2.2s infinite linear;
    }

    @keyframes wave {
      0%,
      60%,
      100% {
        transform: rotate(0deg);
      }
      20% {
        transform: rotate(15deg);
      }
      40% {
        transform: rotate(-10deg);
      }
      80% {
        transform: rotate(5deg);
      }
    }
    .animate-wave {
      animation: wave 2.5s infinite;
      display: inline-block;
    }
  `}</style>
</button>


                      )}
                      <p className="text-sm mt-2">
                        <i>
                          <span className="text-[#005e54] font-bold">69</span>{" "}
                          People Are <span className="font-bold">Claiming</span>{" "}
                          Right Now!
                        </i>
                      </p>
                    </div>
                  </div>
                )}


                {!startChat && (
                  <>
                  <FaqAccordion/>
                
                  <div className="text-center space-y-4 pt-6">
                    <div className="p-3 text-sm text-black">
                      <p>
                        <span className="font-bold text-red-500">NOTE</span>: We
                        don't spam OR sell information & we aren't affiliated
                        with any gov. branch. We are not sponsored by any
                        External Private Organisation.
                      </p>
                    </div>
                    <footer className="p-3 text-center text-xs text-black">
                      <p>
                        Beware of other fraudulent & similar looking websites
                        that might look exactly like ours, we have no
                        affiliation with them. This is the only official website
                        to claim the Benefits You're Qualified For with the
                        domain name mybenefitsai.org
                      </p>
                    </footer>
                  </div>
                    </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <PaymentConfirmation email={email} name={name} userId={userId} tagArray={tags} />
      )}
    </>
  );
}
