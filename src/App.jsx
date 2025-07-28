import Home from "./components/Home";
import CongratulationsPage from "./components/CongoPage";
import { Route, Routes } from "react-router-dom";
import Record from "./components/Record";
import Privacy from "./components/Privacy";
import Email from "./components/Email";
import NewRecord from "./components/NewRecord";
import Confirmation from "./components/Confirmation";

function App(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/record" element={<Record />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/email" element={<Email />} />
      <Route path="/new-record" element={<NewRxecord />} />
      <Route path="/congratulations" element={<CongratulationsPage />} />
    </Routes>
  )
}

export default App;