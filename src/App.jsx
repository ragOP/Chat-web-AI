import Home from "./components/Home";
import CongratulationsPage from "./components/CongoPage";
import { Route, Routes } from "react-router-dom";
import Record from "./components/Record";
import Privacy from "./components/Privacy";
import Email from "./components/Email";

function App(){
  return (
    <Routes>

       {/* <Home /> */}
      <Route path="/" element={<Home />} />
      <Route path="/record" element={<Record />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/email" element={<Email />} />
    </Routes>
  )
}

export default App;