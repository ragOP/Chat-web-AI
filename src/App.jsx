import Home from "./components/Home";
import CongratulationsPage from "./components/CongoPage";
import { Route, Routes } from "react-router-dom";
import Record from "./components/Record";
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";
import Email from "./components/Email";
import NewRecord from "./components/NewRecord";
import Confirmation from "./components/Confirmation";
import Raghib from "./components/Raghib";
import CongratulationsPage2 from "./components/CongoPage2";
import RaghibRecord from "./components/RaghibRecord";
import CongratulationsRouter from './components/CongratulationsRouter'
import PaymentCongratulationsPage from "./components/PaymentCongratulationsPage";
import Payment from "./components/Payment";
import PaymentConfirmation from "./components/PaymentConfirmation";
import Record3 from "./components/Record3";
import { TerminalSquare } from "lucide-react";
import RefundPolicy from "./components/RefundPolicy";
import Red from "./components/Red";
import LanderThree from "./components/LanderThree";
import LanderThreeConfirmation from "./components/LanderThreeConfirmation";
import Sucess from "./components/Sucess";
import Cancel from "./components/Cancel";
import Home2 from "./components/Home2";
import Home3 from "./components/Home3";
import Home4 from "./components/Home4";
import Contact from "./components/Contact";
import MesFree from "./components/MesFree";
function App(){
  return (
    <Routes>
      <Route path="/" element={<Home2 />} />
         <Route path="/free" element={<Home />} />
      <Route path="/record" element={<Record />} />
      <Route path="/privacy" element={<Privacy />} />
         <Route path="/pricing" element={<Red />} />
         <Route path="/contact" element={<Contact />} />
      <Route path="/terms-and-conditions" element={<Terms />} />
         <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/email" element={<Email />} />
      {/* <Route path="/new-record" element={<NewRecord />} /> */}
      <Route path="/congratulations" element={<CongratulationsPage />} />
            {/* <Route path="/noob" element={<CongratulationsRouter />} /> */}

      {/* <Route path="/am1" element={<Raghib />} /> */}
      {/* <Route path="/congratulations2" element={<CongratulationsPage2 />} /> */}
      {/* <Route path="/am1-record" element={<RaghibRecord />} /> */}


  <Route path="/payment" element={<Payment />} />
    <Route path="/cong-pay" element={<PaymentCongratulationsPage />} />
    <Route path="/new-record" element={<Record3 />} />

    <Route path="/messg1" element={<LanderThree />} />
    <Route path="/success" element={<Sucess />} />
    <Route path="/cancel" element={<Cancel />} />
    <Route path="/messg2" element={<Home3 />} />
        <Route path="/mesfree" element={<MesFree />} />
    <Route path="/messg-free" element={<Home4 />} />

    </Routes>
  )
}

export default App;