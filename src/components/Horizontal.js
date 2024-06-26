import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import "./Horizontal.css";
import { Button } from "antd";

const Horizontal = () => {
  const [activosCorrientes, setActivosCorrientes] = useState([
    { nombre: "", valor1: 0, valor2: 0 },
  ]);
  const [activosFijos, setActivosFijos] = useState([
    { nombre: "", valor1: 0, valor2: 0 },
  ]);
  const [otrosActivos, setOtrosActivos] = useState([
    { nombre: "", valor1: 0, valor2: 0 },
  ]);
  const [showResults, setShowResults] = useState(false);
  const [totalActivos, setTotalActivos] = useState(0);
  const [totalActivos2, setTotalActivos2] = useState(0);

  const handleInputChange = (setFunction, index, event) => {
    const { name, value } = event.target;
    setFunction((prevState) => {
      const newState = [...prevState];
      newState[index][name] = value;
      return newState;
    });
  };

  const agregarFila = (setFunction) => {
    setFunction((prevState) => [
      ...prevState,
      { nombre: "", valor1: 0, valor2: 0 },
    ]);
  };

  const calcularSubtotal = (items) => {
    return items.reduce((acc, item) => acc + parseFloat(item.valor1 || 0), 0);
  };

  const calcularSubtotal2 = (items) => {
    return items.reduce((acc, item) => acc + parseFloat(item.valor2 || 0), 0);
  };

  const calcularAnalisisVertical = (valor1, valor2) => {
    return valor2 - valor1;
  };

  const calcularAnalisisSubcuentas = (valor1, valor2) => {
    if (parseFloat(valor1) === 0) {
      return 0;
    }
    return (parseFloat(valor2 || 0) / parseFloat(valor1) - 1) * 100;
  };

  const calcularResultados = () => {
    const subtotalActivosCorrientes = calcularSubtotal(activosCorrientes);
    const subtotalActivosFijos = calcularSubtotal(activosFijos);
    const subtotalOtrosActivos = calcularSubtotal(otrosActivos);
    const subtotalActivosCorrientes2 = calcularSubtotal2(activosCorrientes);
    const subtotalActivosFijos2 = calcularSubtotal2(activosFijos);
    const subtotalOtrosActivos2 = calcularSubtotal2(otrosActivos);
    const totalActivos =
      subtotalActivosCorrientes + subtotalActivosFijos + subtotalOtrosActivos;
    const totalActivos2 =
      subtotalActivosCorrientes2 +
      subtotalActivosFijos2 +
      subtotalOtrosActivos2;
    setTotalActivos(totalActivos);
    setTotalActivos2(totalActivos2);
    setShowResults(true);
  };

  const handleCalculate = () => {
    calcularResultados();
  };

  const exportToExcel = () => {
    const data = [
      [
        "Cuenta",
        "Valor Año 2",
        "Valor Año 3",
        "Variación Absoluta",
        "Variación Relativa",
      ],
      ...activosCorrientes.map((cuenta) => [
        cuenta.nombre,
        cuenta.valor1,
        cuenta.valor2,
        calcularAnalisisVertical(cuenta.valor1, cuenta.valor2),
        calcularAnalisisSubcuentas(cuenta.valor1, cuenta.valor2).toFixed(2) +
          "%",
      ]),
      [
        "Subtotal Activo Corriente",
        calcularSubtotal(activosCorrientes),
        calcularSubtotal2(activosCorrientes),
        calcularAnalisisVertical(
          calcularSubtotal(activosCorrientes),
          calcularSubtotal2(activosCorrientes)
        ),
        calcularAnalisisSubcuentas(
          calcularSubtotal(activosCorrientes),
          calcularSubtotal2(activosCorrientes)
        ).toFixed(2) + "%",
      ],
      ...activosFijos.map((cuenta) => [
        cuenta.nombre,
        cuenta.valor1,
        cuenta.valor2,
        calcularAnalisisVertical(cuenta.valor1, cuenta.valor2),
        calcularAnalisisSubcuentas(cuenta.valor1, cuenta.valor2).toFixed(2) +
          "%",
      ]),
      [
        "Subtotal Activo Fijo",
        calcularSubtotal(activosFijos),
        calcularSubtotal2(activosFijos),
        calcularAnalisisVertical(
          calcularSubtotal(activosFijos),
          calcularSubtotal2(activosFijos)
        ),
        calcularAnalisisSubcuentas(
          calcularSubtotal(activosFijos),
          calcularSubtotal2(activosFijos)
        ).toFixed(2) + "%",
      ],
      ...otrosActivos.map((cuenta) => [
        cuenta.nombre,
        cuenta.valor1,
        cuenta.valor2,
        calcularAnalisisVertical(cuenta.valor1, cuenta.valor2),
        calcularAnalisisSubcuentas(cuenta.valor1, cuenta.valor2).toFixed(2) +
          "%",
      ]),
      [
        "Subtotal Otros Activos",
        calcularSubtotal(otrosActivos),
        calcularSubtotal2(otrosActivos),
        calcularAnalisisVertical(
          calcularSubtotal(otrosActivos),
          calcularSubtotal2(otrosActivos)
        ),
        calcularAnalisisSubcuentas(
          calcularSubtotal(otrosActivos),
          calcularSubtotal2(otrosActivos)
        ).toFixed(2) + "%",
      ],
      [
        "Total Activos",
        totalActivos,
        totalActivos2,
        calcularAnalisisVertical(totalActivos, totalActivos2),
        calcularAnalisisSubcuentas(totalActivos, totalActivos2).toFixed(2) +
          "%",
      ],
      ...activosCorrientes.map((cuenta) => [
        `En terminos de Variación absoluta la cuenta ${
          cuenta.nombre
        } presento un ${calcularAnalisisVertical(
          cuenta.valor1,
          cuenta.valor2
        ).toFixed(
          2
        )}$ en el anio 3 respecto al anio 2 lo que significa en terminos de variacion relativa un incremento de  ${calcularAnalisisSubcuentas(
          cuenta.valor1,
          cuenta.valor2
        ).toFixed(2)}% `,
        "",
        "",
        "",
      ]),
      ...activosFijos.map((cuenta) => [
        `En terminos de Variación absoluta la cuenta ${
          cuenta.nombre
        } presento un ${calcularAnalisisVertical(
          cuenta.valor1,
          cuenta.valor2
        ).toFixed(
          2
        )}$ en el anio 3 respecto al anio 2 lo que significa en terminos de variacion relativa un incremento de  ${calcularAnalisisSubcuentas(
          cuenta.valor1,
          cuenta.valor2
        ).toFixed(2)}% `,
        "",
        "",
        "",
      ]),
      ...otrosActivos.map((cuenta) => [
        `En terminos de Variación absoluta la cuenta ${
          cuenta.nombre
        } presento un ${calcularAnalisisVertical(
          cuenta.valor1,
          cuenta.valor2
        ).toFixed(
          2
        )}$ en el anio 3 respecto al anio 2 lo que significa en terminos de variacion relativa un incremento de  ${calcularAnalisisSubcuentas(
          cuenta.valor1,
          cuenta.valor2
        ).toFixed(2)}% `,
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
    <div>
      {!showResults && (
        <div className="cotenido-horizontal">
          <h3>Estado de Resultados </h3>
          <table className="tabla-horizontal">
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Año 2</th>
                <th>Año 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3">
                  <strong>Activo Corriente</strong>
                </td>
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
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="valor1"
                      value={cuenta.valor1}
                      onChange={(event) =>
                        handleInputChange(setActivosCorrientes, index, event)
                      }
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="valor2"
                      value={cuenta.valor2}
                      onChange={(event) =>
                        handleInputChange(setActivosCorrientes, index, event)
                      }
                      style={{ width: "100%" }}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3">
                  <button
                    className="boton-agregar-activo"
                    onClick={() => agregarFila(setActivosCorrientes)}
                  >
                    Agregar subcuenta
                  </button>
                </td>
              </tr>
              <tr>
                <td colSpan="3">
                  <strong>Activo Fijo</strong>
                </td>
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
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="valor1"
                      value={cuenta.valor1}
                      onChange={(event) =>
                        handleInputChange(setActivosFijos, index, event)
                      }
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="valor2"
                      value={cuenta.valor2}
                      onChange={(event) =>
                        handleInputChange(setActivosFijos, index, event)
                      }
                      style={{ width: "100%" }}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3">
                  <button
                    className="boton-agregar-activo"
                    onClick={() => agregarFila(setActivosFijos)}
                  >
                    Agregar subcuenta
                  </button>
                </td>
              </tr>
              <tr>
                <td colSpan="3">
                  <strong>Otros Activos</strong>
                </td>
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
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="valor1"
                      value={cuenta.valor1}
                      onChange={(event) =>
                        handleInputChange(setOtrosActivos, index, event)
                      }
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="valor2"
                      value={cuenta.valor2}
                      onChange={(event) =>
                        handleInputChange(setOtrosActivos, index, event)
                      }
                      style={{ width: "100%" }}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3">
                  <button
                    className="boton-agregar-activo"
                    onClick={() => agregarFila(setOtrosActivos)}
                  >
                    Agregar subcuenta
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <button
            className="boton-agregar-activo"
            onClick={handleCalculate}
            style={{ marginTop: "20px" }}
          >
            Calcular Resultados
          </button>
          <div className="boton-atras">
            <Link to="/inicio" style={{ color: "#4caf50" }}>
              Atras
            </Link>
          </div>
        </div>
      )}
      {showResults && (
        <div className="resultados-horizontal">
          <h2>Resultados del Análisis</h2>
          <table
            border="1"
            style={{ margin: "0 auto", marginTop: "20px", width: "80%" }}
          >
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Valor Año 2</th>
                <th>Valor Año 3</th>
                <th>Variación Absoluta</th>
                <th>Variación Relativa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5">
                  <strong>Activo Corriente</strong>
                </td>
              </tr>
              {activosCorrientes.map((cuenta, index) => (
                <tr key={index}>
                  <td>{cuenta.nombre}</td>
                  <td>{cuenta.valor1}$</td>
                  <td>{cuenta.valor2}$</td>
                  <td>
                    {calcularAnalisisVertical(cuenta.valor1, cuenta.valor2)}$
                  </td>
                  <td>
                    {calcularAnalisisSubcuentas(
                      cuenta.valor1,
                      cuenta.valor2
                    ).toFixed(2)}
                    %
                  </td>
                </tr>
              ))}
              <tr>
                <td>Subtotal Activo Corriente</td>
                <td>{calcularSubtotal(activosCorrientes)}$</td>
                <td>{calcularSubtotal2(activosCorrientes)}$</td>
                <td>
                  {calcularAnalisisVertical(
                    calcularSubtotal(activosCorrientes),
                    calcularSubtotal2(activosCorrientes)
                  )}
                  $
                </td>
                <td>
                  {calcularAnalisisSubcuentas(
                    calcularSubtotal(activosCorrientes),
                    calcularSubtotal2(activosCorrientes)
                  ).toFixed(2)}
                  %
                </td>
              </tr>
              <tr>
                <td colSpan="5">
                  <strong>Activo Fijo</strong>
                </td>
              </tr>
              {activosFijos.map((cuenta, index) => (
                <tr key={index}>
                  <td>{cuenta.nombre}</td>
                  <td>{cuenta.valor1}$</td>
                  <td>{cuenta.valor2}$</td>
                  <td>
                    {calcularAnalisisVertical(cuenta.valor1, cuenta.valor2)}$
                  </td>
                  <td>
                    {calcularAnalisisSubcuentas(
                      cuenta.valor1,
                      cuenta.valor2
                    ).toFixed(2)}
                    %
                  </td>
                </tr>
              ))}
              <tr>
                <td>Subtotal Activo Fijo</td>
                <td>{calcularSubtotal(activosFijos)}$</td>
                <td>{calcularSubtotal2(activosFijos)}$</td>
                <td>
                  {calcularAnalisisVertical(
                    calcularSubtotal(activosFijos),
                    calcularSubtotal2(activosFijos)
                  )}
                  $
                </td>
                <td>
                  {calcularAnalisisSubcuentas(
                    calcularSubtotal(activosFijos),
                    calcularSubtotal2(activosFijos)
                  ).toFixed(2)}
                  %
                </td>
              </tr>
              <tr>
                <td colSpan="5">
                  <strong>Otros Activos</strong>
                </td>
              </tr>
              {otrosActivos.map((cuenta, index) => (
                <tr key={index}>
                  <td>{cuenta.nombre}$</td>
                  <td>{cuenta.valor1}$</td>
                  <td>{cuenta.valor2}$</td>
                  <td>
                    {calcularAnalisisVertical(cuenta.valor1, cuenta.valor2)}$
                  </td>
                  <td>
                    {calcularAnalisisSubcuentas(
                      cuenta.valor1,
                      cuenta.valor2
                    ).toFixed(2)}
                    %
                  </td>
                </tr>
              ))}
              <tr>
                <td>Subtotal Otros Activos</td>
                <td>{calcularSubtotal(otrosActivos)}$</td>
                <td>{calcularSubtotal2(otrosActivos)}$</td>
                <td>
                  {calcularAnalisisVertical(
                    calcularSubtotal(otrosActivos),
                    calcularSubtotal2(otrosActivos)
                  )}
                  $
                </td>
                <td>
                  {calcularAnalisisSubcuentas(
                    calcularSubtotal(otrosActivos),
                    calcularSubtotal2(otrosActivos)
                  ).toFixed(2)}
                  %
                </td>
              </tr>
              <tr>
                <td>Total Activos</td>
                <td>{totalActivos}$</td>
                <td>{totalActivos2}$</td>
                <td>
                  {calcularAnalisisVertical(totalActivos, totalActivos2)}$
                </td>
                <td>
                  {calcularAnalisisSubcuentas(
                    totalActivos,
                    totalActivos2
                  ).toFixed(2)}
                  %
                </td>
              </tr>
            </tbody>
          </table>
          <div>
            {activosCorrientes.map((cuenta, index) => (
              <tr key={index}>
                <td>
                  En terminos de Variación absoluta la cuenta {cuenta.nombre}{" "}
                  presento un{" "}
                  {calcularAnalisisVertical(
                    cuenta.valor1,
                    cuenta.valor2
                  ).toFixed(2)}
                  $ en el anio 3 respecto al anio 2 lo que significa en terminos
                  de variacion relativa un incremento de{" "}
                  {calcularAnalisisSubcuentas(
                    cuenta.valor1,
                    cuenta.valor2
                  ).toFixed(2)}
                  %{" "}
                </td>
              </tr>
            ))}
            {activosFijos.map((cuenta, index) => (
              <tr key={index}>
                <td>
                  En terminos de Variación absoluta la cuenta {cuenta.nombre}{" "}
                  presento un{" "}
                  {calcularAnalisisVertical(
                    cuenta.valor1,
                    cuenta.valor2
                  ).toFixed(2)}
                  $ en el anio 3 respecto al anio 2 lo que significa en terminos
                  de variacion relativa un incremento de{" "}
                  {calcularAnalisisSubcuentas(
                    cuenta.valor1,
                    cuenta.valor2
                  ).toFixed(2)}
                  %{" "}
                </td>
              </tr>
            ))}
            {otrosActivos.map((cuenta, index) => (
              <tr key={index}>
                <td>
                  En terminos de Variación absoluta la cuenta {cuenta.nombre}{" "}
                  presento un{" "}
                  {calcularAnalisisVertical(
                    cuenta.valor1,
                    cuenta.valor2
                  ).toFixed(2)}
                  $ en el anio 3 respecto al anio 2 lo que significa en terminos
                  de variacion relativa un incremento de{" "}
                  {calcularAnalisisSubcuentas(
                    cuenta.valor1,
                    cuenta.valor2
                  ).toFixed(2)}
                  %{" "}
                </td>
              </tr>
            ))}
          </div>
          <button
            className="boton-agregar-activo"
            onClick={exportToExcel}
            style={{ marginTop: "20px" }}
          >
            Exportar a Excel
          </button>
          <div>
            <Button
              type="link"
              onClick={mostrarTabla}
              style={{ color: "#45a049" }}
            >
              Atras
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Horizontal;
