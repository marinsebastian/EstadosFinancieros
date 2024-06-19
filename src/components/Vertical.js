import React, { useState } from 'react';
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx';

const Vertical = () => {
  const [activosCorrientes, setActivosCorrientes] = useState([{ nombre: '', valor: 0 }]);
  const [activosFijos, setActivosFijos] = useState([{ nombre: '', valor: 0 }]);
  const [otrosActivos, setOtrosActivos] = useState([{ nombre: '', valor: 0 }]);
  const [showResults, setShowResults] = useState(false);
  const [totalActivos, setTotalActivos] = useState(0);

  const handleInputChange = (setFunction, index, event) => {
    const { name, value } = event.target;
    setFunction(prevState => {
      const newState = [...prevState];
      newState[index][name] = value;
      return newState;
    });
  };

  const agregarFila = (setFunction) => {
    setFunction(prevState => [...prevState, { nombre: '', valor: 0 }]);
  };

  const calcularSubtotal = (items) => {
    return items.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
  };

  const calcularAnalisisVertical = (cuenta, totalActivos) => {
    return (cuenta / totalActivos) * 100;
  };

  const calcularAnalisisSubcuentas = (cuenta, subtotal) => {
    return (cuenta / subtotal) * 100;
  };

  const calcularResultados = () => {
    const subtotalActivosCorrientes = calcularSubtotal(activosCorrientes);
    const subtotalActivosFijos = calcularSubtotal(activosFijos);
    const subtotalOtrosActivos = calcularSubtotal(otrosActivos);
    const totalActivos = subtotalActivosCorrientes + subtotalActivosFijos + subtotalOtrosActivos;
    setTotalActivos(totalActivos);
    setShowResults(true);
  };

  const handleCalculate = () => {
    calcularResultados();
  };

  const exportToExcel = () => {
    const data = [
      ['Cuenta', 'Valor', 'Análisis Vertical', 'Análisis Subcuentas'],
      ...activosCorrientes.map(cuenta => [
        cuenta.nombre,
        cuenta.valor,
        calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2) + '%',
        calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(activosCorrientes)).toFixed(2) + '%'
      ]),
      ['Subtotal Activo Corriente', calcularSubtotal(activosCorrientes), calcularAnalisisVertical(calcularSubtotal(activosCorrientes), totalActivos).toFixed(2) + '%', ''],
      ...activosFijos.map(cuenta => [
        cuenta.nombre,
        cuenta.valor,
        calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2) + '%',
        calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(activosFijos)).toFixed(2) + '%'
      ]),
      ['Subtotal Activo Fijo', calcularSubtotal(activosFijos), calcularAnalisisVertical(calcularSubtotal(activosFijos), totalActivos).toFixed(2) + '%', ''],
      ...otrosActivos.map(cuenta => [
        cuenta.nombre,
        cuenta.valor,
        calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2) + '%',
        calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(otrosActivos)).toFixed(2) + '%'
      ]),
      ['Subtotal Otros Activos', calcularSubtotal(otrosActivos), calcularAnalisisVertical(calcularSubtotal(otrosActivos), totalActivos).toFixed(2) + '%', ''],
      ['Total Activos', totalActivos, '100%', ''],
      ...activosCorrientes.map(cuenta => [
        `${cuenta.nombre} representa un ${calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)}% del total de activos y un ${calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(activosCorrientes)).toFixed(2)}% del subtotal de activos corrientes`, '', '', ''
      ]),
      ...activosFijos.map(cuenta => [
        `${cuenta.nombre} representa un ${calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)}% del total de activos y un ${calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(activosFijos)).toFixed(2)}% del subtotal de activos fijos`, '', '', ''
      ]),
      ...otrosActivos.map(cuenta => [
        `${cuenta.nombre} representa un ${calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)}% del total de activos y un ${calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(otrosActivos)).toFixed(2)}% del subtotal de otros activos`, '', '', ''
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");

    XLSX.writeFile(workbook, "Resultados.xlsx");
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Estado de Resultados - Año 1</h1>
      <table border="1" style={{ margin: '0 auto', marginTop: '20px', width: '80%' }}>
        <thead>
          <tr>
            <th>Cuenta</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="2"><strong>Activo Corriente</strong></td>
          </tr>
          {activosCorrientes.map((cuenta, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  name="nombre"
                  value={cuenta.nombre}
                  onChange={(event) => handleInputChange(setActivosCorrientes, index, event)}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="valor"
                  value={cuenta.valor}
                  onChange={(event) => handleInputChange(setActivosCorrientes, index, event)}
                  style={{ width: '100%' }}
                />
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan="2">
              <button onClick={() => agregarFila(setActivosCorrientes)}>Agregar Cuenta Activo Corriente</button>
            </td>
          </tr>
          <tr>
            <td colSpan="2"><strong>Activo Fijo</strong></td>
          </tr>
          {activosFijos.map((cuenta, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  name="nombre"
                  value={cuenta.nombre}
                  onChange={(event) => handleInputChange(setActivosFijos, index, event)}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="valor"
                  value={cuenta.valor}
                  onChange={(event) => handleInputChange(setActivosFijos, index, event)}
                  style={{ width: '100%' }}
                />
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan="2">
              <button onClick={() => agregarFila(setActivosFijos)}>Agregar Cuenta Activo Fijo</button>
            </td>
          </tr>
          <tr>
            <td colSpan="2"><strong>Otros Activos</strong></td>
          </tr>
          {otrosActivos.map((cuenta, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  name="nombre"
                  value={cuenta.nombre}
                  onChange={(event) => handleInputChange(setOtrosActivos, index, event)}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="valor"
                  value={cuenta.valor}
                  onChange={(event) => handleInputChange(setOtrosActivos, index, event)}
                  style={{ width: '100%' }}
                />
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan="2">
              <button onClick={() => agregarFila(setOtrosActivos)}>Agregar Cuenta otro activo</button>
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              <button onClick={handleCalculate}>Calcular</button>
            </td>
          </tr>
        </tbody>
      </table>

      {showResults && (
        <div>
          <h1>Resultados</h1>
          <table border="1" style={{ margin: '0 auto', marginTop: '20px', width: '80%' }}>
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Valor</th>
                <th>Análisis Vertical</th>
                <th>Análisis Subcuentas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4"><strong>Activo Corriente</strong></td>
              </tr>
              {activosCorrientes.map((cuenta, index) => (
                <tr key={index}>
                  <td>{cuenta.nombre}</td>
                  <td>{cuenta.valor}$</td>
                  <td>{calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)}%</td>
                  <td>{calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(activosCorrientes)).toFixed(2)}%</td>
                </tr>
              ))}
              <tr>
                <td><strong>Subtotal Activo Corriente</strong></td>
                <td>{calcularSubtotal(activosCorrientes)}$</td>
                <td>{calcularAnalisisVertical(calcularSubtotal(activosCorrientes), totalActivos).toFixed(2)}%</td>
                <td>{activosCorrientes.reduce((acc, item) => acc + calcularAnalisisSubcuentas(item.valor, calcularSubtotal(activosCorrientes)), 0).toFixed(2)}%</td>
              </tr>
              <tr>
                <td colSpan="4"><strong>Activo Fijo</strong></td>
              </tr>
              {activosFijos.map((cuenta, index) => (
                <tr key={index}>
                  <td>{cuenta.nombre} </td>
                  <td>{cuenta.valor}$</td>
                  <td>{calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)}%</td>
                  <td>{calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(activosFijos)).toFixed(2)}%</td>
                </tr>
              ))}
              <tr>
                <td><strong>Subtotal Activo Fijo</strong></td>
                <td>{calcularSubtotal(activosFijos)}</td>
                <td>{calcularAnalisisVertical(calcularSubtotal(activosFijos), totalActivos).toFixed(2)}%</td>
                <td>{activosFijos.reduce((acc, item) => acc + calcularAnalisisSubcuentas(item.valor, calcularSubtotal(activosFijos)), 0).toFixed(2)}%</td>
              </tr>
              <tr>
                <td colSpan="4"><strong>Otros Activos</strong></td>
              </tr>
              {otrosActivos.map((cuenta, index) => (
                <tr key={index}>
                  <td>{cuenta.nombre}</td>
                  <td>{cuenta.valor}</td>
                  <td>{calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)}%</td>
                  <td>{calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(otrosActivos)).toFixed(2)}%</td>
                </tr>
              ))}
              <tr>
                <td><strong>Subtotal Otros Activos</strong></td>
                <td>{calcularSubtotal(otrosActivos)}</td>
                <td>{calcularAnalisisVertical(calcularSubtotal(otrosActivos), totalActivos).toFixed(2)}%</td>
                <td>{otrosActivos.reduce((acc, item) => acc + calcularAnalisisSubcuentas(item.valor, calcularSubtotal(otrosActivos)), 0).toFixed(2)}%</td>
              </tr>
              <tr>
                <td><strong>Total Activos</strong></td>
                <td>{totalActivos}</td>
                <td>{(calcularAnalisisVertical(calcularSubtotal(activosCorrientes), totalActivos) +
                  calcularAnalisisVertical(calcularSubtotal(activosFijos), totalActivos) +
                  calcularAnalisisVertical(calcularSubtotal(otrosActivos), totalActivos)).toFixed(2)}%</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
          <button onClick={exportToExcel} style={{ marginTop: '20px' }}>Descargar en Excel</button>
          <div>
            {activosCorrientes.map((cuenta, index) => (
              <tr key={index}>
                <td>{cuenta.nombre} representa un {calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)}% del total de activos y un {calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(activosCorrientes)).toFixed(2)}% del subtotal de activos corrientes</td>
              </tr>
            ))}
            {activosFijos.map((cuenta, index) => (
              <tr key={index}>
                <td>{cuenta.nombre} representa un {calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)}% del total de activos y un {calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(activosFijos)).toFixed(2)}% del subtotal de activos fijos</td>
              </tr>
            ))}
            {otrosActivos.map((cuenta, index) => (
              <tr key={index}>
                <td>{cuenta.nombre} representa un {calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)}% del total de activos y un {calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(otrosActivos)).toFixed(2)}% del subtotal de otros activos</td>
              </tr>
            ))}
          </div>
        </div>
      )}
      <div> 
        <Link to="/">atras</Link>
      </div>
    </div>
  );
};

export default Vertical;
