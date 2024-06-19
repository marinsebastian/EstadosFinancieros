import UploadFile from "./components/uploadFile";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from "react";
import './App.css';
import Inicio from './components/Inicio';
import Vertical from "./components/Vertical";
import Horizontal from "./components/Horizontal";
import HorizontalBase from "./components/HorizontalBase";
import Main from "./components/Main";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main/>}/>
        <Route path='/inicio' element ={<Inicio/>}/>
        <Route path="/vertical" element = {<Vertical/>}/>
        <Route path="/horizontal" element ={<Horizontal/>}/>
        <Route path="/horizontalbase" element ={<HorizontalBase/>}/>
        <Route path="uploadfile" element={<UploadFile/>}/>
      </Routes>
    </Router>
  );
}

export default App;

