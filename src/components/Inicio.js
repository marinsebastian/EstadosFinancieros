import React from "react";
import { Link } from "react-router-dom";
import './Inicio.css'; // Importamos el archivo CSS

const Inicio = () => {
  return (
    <div className="inicio-container">
      <h1 className="title">REALIZAR ANÁLISIS:</h1>
      <div className="link-container">
        <Link to="/vertical" className="link">Vertical</Link>
        <Link to="/horizontal" className="link">Horizontal</Link>
        <Link to="/horizontalbase" className="link">Analisis de tendencia</Link>
      </div>
      <button className="back-button">
        <Link to="/" className="back-link">Atrás</Link>
      </button>
    </div>
  );
};

export default Inicio;
