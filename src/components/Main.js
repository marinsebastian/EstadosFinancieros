import React from "react";
import { Link } from "react-router-dom";
import './Main.css'; // Importamos el archivo CSS

const Main = () => {
  return (
    <div className="main-container">
      <h1 className="title">ANÁLISIS DE ESTADOS FINANCIEROS</h1>
      <p className="subtitle">Ingrese estado de resultados</p>
      <div className="link-container">
        <Link to="inicio" className="link">Ingresar datos manualmente</Link>
        <Link to="uploadfile" className="link">Importar datos de Excel</Link>
      </div>
    </div>
  );
};

export default Main;
