import Home from "./components/Home";
import CongratulationsPage from "./components/CongoPage";
import { Route, Routes } from "react-router-dom";
import Record from "./components/Record";

function App(){
  return (
    <Routes>

       {/* <Home /> */}
      <Route path="/" element={<Home />} />
      <Route path="/record" element={<Record />} />
    </Routes>
  )
}

export default App;