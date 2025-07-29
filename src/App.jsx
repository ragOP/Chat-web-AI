import Home from "./components/Home";
import CongratulationsPage from "./components/CongoPage";
import { Route, Routes } from "react-router-dom";
import Record from "./components/Record";
import Privacy from "./components/Privacy";
import Email from "./components/Email";
import NewRecord from "./components/NewRecord";
import Confirmation from "./components/Confirmation";
import Raghib from "./components/Raghib";
import CongratulationsPage2 from "./components/CongoPage2";
import RaghibRecord from "./components/RaghibRecord";

function App(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/record" element={<Record />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/email" element={<Email />} />
      <Route path="/new-record" element={<NewRecord />} />
      <Route path="/congratulations" element={<CongratulationsPage />} />
      <Route path="/raghib" element={<Raghib />} />
      <Route path="/congratulations2" element={<CongratulationsPage2 />} />
      <Route path="/raghib-record" element={<RaghibRecord />} />
    </Routes>
  )
}

export default App;