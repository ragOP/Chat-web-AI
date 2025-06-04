import Home from "./components/Home";
import CongratulationsPage from "./components/CongoPage";
import { Route, Routes } from "react-router-dom";

function App(){
  return (
    <Routes>

       {/* <Home /> */}
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App;