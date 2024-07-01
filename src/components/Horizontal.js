import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import "./Horizontal.css";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const Horizontal = () => {
  const [activosCorrientes, setActivosCorrientes] = useState([{ nombre: "efectivo", valor1: 1924, valor2: 7368},{ nombre: "inversiones temporales", valor1: 15415, valor2: 1825},{ nombre: "cxc clientes", valor1: 3005, valor2:4121},{ nombre: "otros deudores", valor1: 2279,valor2:2891},{ nombre: "inventario", valor1: 19914,valor2:24511},]);
  const [activosFijos, setActivosFijos] = useState([{ nombre: "terrenos", valor1: 2257,valor2:2849},{ nombre: "construcciones en curso", valor1: 3727,valor2:1510},{ nombre: "edificios", valor1: 23492,valor2:40445},{ nombre: "maquinaria y equipo", valor1: 32598,valor2:53960},{ nombre: "vehiculo", valor1: 3455,valor2:3418},{ nombre: "menos depreciacion acomulada", valor1: -16042, valor2:-24931},]);
  const [otrosActivos, setOtrosActivos] = useState([{ nombre: "inversiones permanentes", valor1: 143,valor2:127 },{ nombre: "activos diferidos", valor1: 3712,valor2:7883},{ nombre: "deudores a largo plazo", valor1: 0,valor2:0},{ nombre: "otros activos", valor1: 1757,valor2:1876},{ nombre: "valorizaciones", valor1: 36263,valor2:49127},]);
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

  const eliminarFila = (setFunction, index) => {
    setFunction((prevState) => {
      const newState = [...prevState];
      newState.splice(index, 1);
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
    <div className="contenedor-horizontal">
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
                <td className="subtitulo" colSpan="3">
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
                  <td><button onClick={() => eliminarFila(setActivosCorrientes, index)}>
                    Eliminar
                  </button></td>
                </tr>
              ))}
              <tr>
                <td colSpan="3">
                  <Button
                    className="boton-agregar-activo"
                    onClick={() => agregarFila(setActivosCorrientes)}
                  >
                    Agregar subcuenta
                  </Button>
                </td>
              </tr>
              <tr>
                <td className="subtitulo" colSpan="3">
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
                  <td><button onClick={() => eliminarFila(setActivosFijos, index)}>
                    Eliminar
                  </button></td>
                </tr>
              ))}
              <tr>
                <td colSpan="3">
                  <Button
                    className="boton-agregar-activo"
                    onClick={() => agregarFila(setActivosFijos)}
                  >
                    Agregar subcuenta
                  </Button>
                </td>
              </tr>
              <tr>
                <td className="subtitulo" colSpan="3">
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
                  <td><button onClick={() => eliminarFila(setOtrosActivos, index)}>
                    Eliminar
                  </button></td>
                </tr>
              ))}
              <tr>
                <td colSpan="3">
                  <Button
                    className="boton-agregar-activo"
                    onClick={() => agregarFila(setOtrosActivos)}
                  >
                    Agregar subcuenta
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
          <Button
            className="boton-calcular-resultado"
            type="primary"
            onClick={handleCalculate}
          >
            Calcular Resultados
          </Button>
          <Button type="primary" className="boton-atras">
            <Link to="/inicio">Atrás</Link>
          </Button>
        </div>
      )}
      {showResults && (
        <div className="resultados-horizontal">
          <h2>Resultados del Análisis</h2>
          <table
            border="1"
            className="tabla-resultado-horizontal"
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
                <td className="subtitulo" colSpan="5">
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
                <td></td>
              </tr>
              <tr>
                <td className="subtitulo" colSpan="5">
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
                <td className="subtitulo" colSpan="5">
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
          <Button
            className="boton-descargar"
            onClick={exportToExcel}
            icon={<DownloadOutlined />}
          >
            Exportar a Excel
          </Button>
          <div>
            <Button
              type="primary"
              onClick={mostrarTabla}
              className="boton-atras-resultado"
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
