import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import "./Vertical.css"; // Importamos el archivo CSS
import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const Vertical = () => {
  const [activosCorrientes, setActivosCorrientes] = useState([{ nombre: "efectivo", valor: 1924 }, { nombre: "inversiones temporales", valor: 15415 }, { nombre: "cxc clientes", valor: 3005 }, { nombre: "otros deudores", valor: 2279 }, { nombre: "inventario", valor: 19914 },]);
  const [activosFijos, setActivosFijos] = useState([{ nombre: "terrenos", valor: 2257 }, { nombre: "construcciones en curso", valor: 3727 }, { nombre: "edificios", valor: 23492 }, { nombre: "maquinaria y equipo", valor: 32598 }, { nombre: "vehiculo", valor: 3455 }, { nombre: "menos depreciacion acomulada", valor: -16042 },]);
  const [otrosActivos, setOtrosActivos] = useState([{ nombre: "inversiones permanentes", valor: 143 }, { nombre: "activos diferidos", valor: 3712 }, { nombre: "deudores a largo plazo", valor: 0 }, { nombre: "otros activos", valor: 1757 }, { nombre: "valorizaciones", valor: 36263 },]);
  const [showResults, setShowResults] = useState(false);
  const [totalActivos, setTotalActivos] = useState(0);

  const handleInputChange = (setFunction, index, event) => {
    const { name, value } = event.target;
    setFunction((prevState) => {
      const newState = [...prevState];
      newState[index][name] = value;
      return newState;
    });
  };

  const eliminarFila = (setFunction, index) => {
    setFunction((prevState) => {
      const newState = [...prevState];
      newState.splice(index, 1);
      return newState;
    });
  };

  const agregarFila = (setFunction) => {
    setFunction((prevState) => [...prevState, { nombre: "", valor: 0 }]);
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
    const totalActivos =
      subtotalActivosCorrientes + subtotalActivosFijos + subtotalOtrosActivos;
    setTotalActivos(totalActivos);
    setShowResults(true);
  };

  const handleCalculate = () => {
    if (
      activosCorrientes[0].nombre === "" &&
      activosCorrientes[0].valor === 0 &&
      activosFijos[0].nombre === "" &&
      activosFijos[0].valor === 0 &&
      otrosActivos[0].nombre === "" &&
      otrosActivos[0].valor === 0
    ) {
      message.error("No es posible continuar: existen campos vacíos.");
    } else {
      calcularResultados();
    }
  };

  const exportToExcel = () => {
    const data = [
      ["Cuenta", "Valor", "Análisis Vertical", "Análisis Subcuentas"],
      ...activosCorrientes.map((cuenta) => [
        cuenta.nombre,
        cuenta.valor,
        calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2) + "%",
        calcularAnalisisSubcuentas(
          cuenta.valor,
          calcularSubtotal(activosCorrientes)
        ).toFixed(2) + "%",
      ]),
      [
        "Subtotal Activo Corriente",
        calcularSubtotal(activosCorrientes),
        calcularAnalisisVertical(
          calcularSubtotal(activosCorrientes),
          totalActivos
        ).toFixed(2) + "%",
        "",
      ],
      ...activosFijos.map((cuenta) => [
        cuenta.nombre,
        cuenta.valor,
        calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2) + "%",
        calcularAnalisisSubcuentas(
          cuenta.valor,
          calcularSubtotal(activosFijos)
        ).toFixed(2) + "%",
      ]),
      [
        "Subtotal Activo Fijo",
        calcularSubtotal(activosFijos),
        calcularAnalisisVertical(
          calcularSubtotal(activosFijos),
          totalActivos
        ).toFixed(2) + "%",
        "",
      ],
      ...otrosActivos.map((cuenta) => [
        cuenta.nombre,
        cuenta.valor,
        calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2) + "%",
        calcularAnalisisSubcuentas(
          cuenta.valor,
          calcularSubtotal(otrosActivos)
        ).toFixed(2) + "%",
      ]),
      [
        "Subtotal Otros Activos",
        calcularSubtotal(otrosActivos),
        calcularAnalisisVertical(
          calcularSubtotal(otrosActivos),
          totalActivos
        ).toFixed(2) + "%",
        "",
      ],
      ["Total Activos", totalActivos, "100%", ""],
      ...activosCorrientes.map((cuenta) => [
        `${cuenta.nombre} representa un ${calcularAnalisisVertical(
          cuenta.valor,
          totalActivos
        ).toFixed(2)}% del total de activos y un ${calcularAnalisisSubcuentas(
          cuenta.valor,
          calcularSubtotal(activosCorrientes)
        ).toFixed(2)}% del subtotal de activos corrientes`,
        "",
        "",
        "",
      ]),
      ...activosFijos.map((cuenta) => [
        `${cuenta.nombre} representa un ${calcularAnalisisVertical(
          cuenta.valor,
          totalActivos
        ).toFixed(2)}% del total de activos y un ${calcularAnalisisSubcuentas(
          cuenta.valor,
          calcularSubtotal(activosFijos)
        ).toFixed(2)}% del subtotal de activos fijos`,
        "",
        "",
        "",
      ]),
      ...otrosActivos.map((cuenta) => [
        `${cuenta.nombre} representa un ${calcularAnalisisVertical(
          cuenta.valor,
          totalActivos
        ).toFixed(2)}% del total de activos y un ${calcularAnalisisSubcuentas(
          cuenta.valor,
          calcularSubtotal(otrosActivos)
        ).toFixed(2)}% del subtotal de otros activos`,
        "",
        "",
        "",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");

    XLSX.writeFile(workbook, "Resultados.xlsx");
  };

  const mostrarTabla = () => {
    setShowResults(false);
  };

  return (
    <div className="contenedor-vertical">
      {!showResults && (
        <div className="vertical-container1">
          <h1 className="title">Estado de Resultados - Año </h1>
          <table className="financial-table">
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th colSpan="2">Activo Corriente</th>
              </tr>
              {activosCorrientes.map((cuenta, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      name="nombre"
                      value={cuenta.nombre}
                      onChange={(event) =>
                        handleInputChange(setActivosCorrientes, index, event)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="valor"
                      value={cuenta.valor}
                      onChange={(event) =>
                        handleInputChange(setActivosCorrientes, index, event)
                      }
                    />
                  </td>
                  <td><button onClick={() => eliminarFila(setActivosCorrientes, index)}>
                    Eliminar
                  </button></td>
                </tr>
              ))}
              <tr>
                <td colSpan="2">
                  <Button
                    className="add-button"
                    onClick={() => agregarFila(setActivosCorrientes)}
                  >
                    Agregar Activo Corriente
                  </Button>
                </td>
              </tr>
              <tr>
                <th colSpan="2">Activo Fijo</th>
              </tr>
              {activosFijos.map((cuenta, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      name="nombre"
                      value={cuenta.nombre}
                      onChange={(event) =>
                        handleInputChange(setActivosFijos, index, event)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="valor"
                      value={cuenta.valor}
                      onChange={(event) =>
                        handleInputChange(setActivosFijos, index, event)
                      }
                    />
                  </td>
                  <td><button onClick={() => eliminarFila(setActivosFijos, index)}>
                    Eliminar
                  </button></td>
                </tr>
              ))}
              <tr>
                <td colSpan="2">
                  <Button
                    className="add-button"
                    onClick={() => agregarFila(setActivosFijos)}
                  >
                    Agregar Activo Fijo
                  </Button>
                </td>
              </tr>
              <tr>
                <th colSpan="2">Otros Activos</th>
              </tr>
              {otrosActivos.map((cuenta, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      name="nombre"
                      value={cuenta.nombre}
                      onChange={(event) =>
                        handleInputChange(setOtrosActivos, index, event)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="valor"
                      value={cuenta.valor}
                      onChange={(event) =>
                        handleInputChange(setOtrosActivos, index, event)
                      }
                    />
                  </td>
                  <td><button onClick={() => eliminarFila(setOtrosActivos, index)}>
                    Eliminar
                  </button></td>
                </tr>
              ))}
              <tr>
                <td colSpan="2">
                  <Button
                    className="add-button"
                    onClick={() => agregarFila(setOtrosActivos)}
                  >
                    Agregar Otros Activos
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
          <Button
            className="calculate-button"
            onClick={handleCalculate}
            type="primary"
          >
            Calcular
          </Button>
        </div>
      )}
      {showResults && (
        <div className="results">
          <h1>Resultados</h1>
          <table className="financial-table">
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
                <th colSpan="4">Activo Corriente</th>
              </tr>
              {activosCorrientes.map((cuenta, index) => (
                <tr key={index}>
                  <td>{cuenta.nombre}</td>
                  <td>{cuenta.valor}</td>
                  <td>
                    {calcularAnalisisVertical(
                      cuenta.valor,
                      totalActivos
                    ).toFixed(2) + "%"}
                  </td>
                  <td>
                    {calcularAnalisisSubcuentas(
                      cuenta.valor,
                      calcularSubtotal(activosCorrientes)
                    ).toFixed(2) + "%"}
                  </td>
                </tr>
              ))}
              <tr>
                <td>Subtotal Activo Corriente</td>
                <td>{calcularSubtotal(activosCorrientes)}</td>
                <td>
                  {calcularAnalisisVertical(
                    calcularSubtotal(activosCorrientes),
                    totalActivos
                  ).toFixed(2) + "%"}
                </td>
                <td>100%</td>
              </tr>
              <tr>
                <th colSpan="4">Activo Fijo</th>
              </tr>
              {activosFijos.map((cuenta, index) => (
                <tr key={index}>
                  <td>{cuenta.nombre}</td>
                  <td>{cuenta.valor}</td>
                  <td>
                    {calcularAnalisisVertical(
                      cuenta.valor,
                      totalActivos
                    ).toFixed(2) + "%"}
                  </td>
                  <td>
                    {calcularAnalisisSubcuentas(
                      cuenta.valor,
                      calcularSubtotal(activosFijos)
                    ).toFixed(2) + "%"}
                  </td>
                </tr>
              ))}
              <tr>
                <td>Subtotal Activo Fijo</td>
                <td>{calcularSubtotal(activosFijos)}</td>
                <td>
                  {calcularAnalisisVertical(
                    calcularSubtotal(activosFijos),
                    totalActivos
                  ).toFixed(2) + "%"}
                </td>
                <td>100%</td>
              </tr>
              <tr>
                <th colSpan="4">Otros Activos</th>
              </tr>
              {otrosActivos.map((cuenta, index) => (
                <tr key={index}>
                  <td>{cuenta.nombre}</td>
                  <td>{cuenta.valor}</td>
                  <td>
                    {calcularAnalisisVertical(
                      cuenta.valor,
                      totalActivos
                    ).toFixed(2) + "%"}
                  </td>
                  <td>
                    {calcularAnalisisSubcuentas(
                      cuenta.valor,
                      calcularSubtotal(otrosActivos)
                    ).toFixed(2) + "%"}
                  </td>
                </tr>
              ))}
              <tr>
                <td>Subtotal Otros Activos</td>
                <td>{calcularSubtotal(otrosActivos)}</td>
                <td>
                  {calcularAnalisisVertical(
                    calcularSubtotal(otrosActivos),
                    totalActivos
                  ).toFixed(2) + "%"}
                </td>
                <td>100%</td>
              </tr>
              <tr>
                <td>Total Activos</td>
                <td>{totalActivos}</td>
                <td>100%</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
          <div>
            {activosCorrientes.map((cuenta, índice) => (
              < tr clave={índice} >
                < td > {cuenta.nombre} representa un {calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)} % del total de activos y un {calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(activosCorrientes)).
                  toFixed(2)} % del subtotal de activos corrientes </td>
              </tr>
            ))}
            {activosFijos.map((cuenta, índice) => (
              < tr clave={índice} >
                < td > {cuenta.nombre} representa un {calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)} % del total de activos y un {calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(activosFijos)).
                  toFixed(2)} % del subtotal de activos fijos </td>
              </tr>
            ))}
            {otrosActivos.map((cuenta, índice) => (
              < tr clave={índice} >
                < td > {cuenta.nombre} representa un {calcularAnalisisVertical(cuenta.valor, totalActivos).toFixed(2)} % del total de activos y un {calcularAnalisisSubcuentas(cuenta.valor, calcularSubtotal(otrosActivos)).
                  toFixed(2)} % del subtotal de otros activos  </td>
              </tr>
            ))}
          </div>
          <Button
            className="download-button"
            onClick={exportToExcel}
            icon={<DownloadOutlined />}
          >
            Descargar Excel
          </Button>
          <Button
            className="boton-volver"
            type="primary"
            onClick={mostrarTabla}
          >
            Volver
          </Button>
        </div>
      )}
      <div className="back-link">
        <Link to="/">Volver al inicio</Link>
      </div>
    </div>
  );
};

export default Vertical;
