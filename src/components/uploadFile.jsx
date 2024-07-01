import "./Upload.css";
import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import EditableTable from "./EditableTable";
import { Link } from "react-router-dom";
import { Upload, Button, message, Select, InputNumber, Modal } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
//import Modal from "./Modal";

const { Option } = Select;

function UploadFile() {
  const [data, setData] = useState([]);
  const [analysisType, setAnalysisType] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [verticalColumn, setVerticalColumn] = useState(null);
  const [selectedRows, setSelectedRows] = useState({
    range1: { start: null, end: null },
    range2: { start: null, end: null },
    range3: { start: null, end: null },
  });
  const [normalValueCount, setNormalValueCount] = useState(1);
  const [format, setFormat] = useState("formato1");
  const [modalInfo, setModalInfo] = useState(null);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const rawData = e.target.result;
      const workbook = XLSX.read(rawData, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setData(parsedData);
      message.success(`${file.name} cargado exitosamente.`);
    };
    reader.onerror = () => {
      message.error(`Error al cargar el archivo ${file.name}.`);
    };
    return false;
  };

  const handleAnalysis = () => {
    if (analysisType === "horizontal" && selectedColumns.length === 2) {
      const [col1, col2] = selectedColumns;
      const updatedData = data.map((row) => {
        const varAbs = (row[col2] - row[col1]).toFixed(2);
        const varRel = ((varAbs / row[col1]) * 100).toFixed(2);
        return {
          ...row,
          "VARIACION ABSOLUTA": varAbs,
          "VARIACION RELATIVA": varRel,
        };
      });
      setData(updatedData);
    } else if (analysisType === "vertical" && verticalColumn) {
      const lastRowValue = data[data.length - 1][verticalColumn];
      const updatedData = data.map((row) => {
        const analysisVertical = ((row[verticalColumn] / lastRowValue) * 100).toFixed(2);
        return {
          ...row,
          "ANALISIS VERTICAL": analysisVertical,
        };
      });
      setData(updatedData);
    } else if (analysisType === "verticalSubcuentas" && verticalColumn) {
      const updatedData = data.map((row, rowIndex) => {
        let analysisVerticalSubcuentas = 0;
        for (const range in selectedRows) {
          const { start, end } = selectedRows[range];
          if (start !== null && end !== null) {
            const endRowValue = data.find(
              (r) => r[Object.keys(data[0])[0]] === end
            )[verticalColumn];
            if (
              rowIndex >=
                data.findIndex((r) => r[Object.keys(data[0])[0]] === start) &&
              rowIndex <=
                data.findIndex((r) => r[Object.keys(data[0])[0]] === end) &&
              endRowValue !== 0
            ) {
              analysisVerticalSubcuentas =
                ((row[verticalColumn] / endRowValue) * 100).toFixed(2);
              break;
            }
          }
        }
        return {
          ...row,
          "ANALISIS VERTICAL SUBCUENTAS": analysisVerticalSubcuentas,
        };
      });
      setData(updatedData);
    } else if (analysisType === "tendencias" && verticalColumn) {
      const updatedData = data.map((row) => {
        const newRow = { ...row };
        const baseValue = row[verticalColumn];
        Object.keys(row).forEach((key, index) => {
          if (index > 0) {
            newRow[`AT:${key}`] = ((row[key] / baseValue) * 100).toFixed(2);
          }
        });
        return newRow;
      });
      setData(updatedData);
    } else if (
      analysisType === "normalDistribution" &&
      selectedColumns.length === 2
    ) {
      const colIndices = selectedColumns.map((col) =>
        Object.keys(data[0]).indexOf(col)
      );
      const [startIndex, endIndex] = colIndices.sort((a, b) => a - b);

      let updatedData = data.map((row) => {
        const values = Object.keys(row)
          .slice(startIndex, endIndex + 1)
          .map((key) => parseFloat(row[key]));
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance =
          values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const newRow = { ...row };
        for (let i = 1; i <= normalValueCount; i++) {
          const randomValue = Math.random();
          const projection = (mean + stdDev * randomValue).toFixed(2);
          newRow[`PROYECCION AÑO ${i}`] = parseFloat(projection);
        }
        return newRow;
      });

      if (format === "formato1") {
        for (let i = 0; i < updatedData.length; i++) {
          if (i === 5) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData
              .slice(0, 5)
              .reduce(
                (sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`],
                0
              )
              .toFixed(2);
          } else if (i === 12) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData
              .slice(6, 12)
              .reduce(
                (sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`],
                0
              )
              .toFixed(2);
          } else if (i === 18) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData
              .slice(13, 18)
              .reduce(
                (sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`],
                0
              )
              .toFixed(2);
          } else if (i === 19) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (
              parseFloat(updatedData[5][`PROYECCION AÑO ${normalValueCount}`]) +
              parseFloat(
                updatedData[12][`PROYECCION AÑO ${normalValueCount}`]
              ) +
              parseFloat(updatedData[18][`PROYECCION AÑO ${normalValueCount}`])
            ).toFixed(2);
          }
        }
      } else if (format === "formato2") {
        for (let i = 0; i < updatedData.length; i++) {
          if (i === 1) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData
              .slice(2, 7)
              .reduce(
                (sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`],
                0
              )
              .toFixed(2);
          } else if (i === 7) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData
              .slice(8, 11)
              .reduce(
                (sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`],
                0
              )
              .toFixed(2);
          } else if (i === 12) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData
              .slice(14, 17)
              .reduce(
                (sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`],
                0
              )
              .toFixed(2);
          } else if (i === 20) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData
              .slice(21, 25)
              .reduce(
                (sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`],
                0
              )
              .toFixed(2);
          }
        }
        for (let i = 0; i < updatedData.length; i++) {
          if (i === 0) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (
              parseFloat(updatedData[1][`PROYECCION AÑO ${normalValueCount}`]) +
              parseFloat(updatedData[7][`PROYECCION AÑO ${normalValueCount}`])
            ).toFixed(2);
          } else if (i === 13) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (
              parseFloat(
                updatedData[14][`PROYECCION AÑO ${normalValueCount}`]
              ) +
              parseFloat(updatedData[18][`PROYECCION AÑO ${normalValueCount}`])
            ).toFixed(2);
          } else if (i === 17) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (
              parseFloat(
                updatedData[18][`PROYECCION AÑO ${normalValueCount}`]
              ) +
              parseFloat(updatedData[19][`PROYECCION AÑO ${normalValueCount}`])
            ).toFixed(2);
          }
        }
        for (let i = updatedData.length; i > 0; i--) {
          if (i === 12) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (
              parseFloat(
                updatedData[13][`PROYECCION AÑO ${normalValueCount}`]
              ) +
              parseFloat(updatedData[17][`PROYECCION AÑO ${normalValueCount}`])
            ).toFixed(2);
          } else if (i === 11) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (
              parseFloat(
                updatedData[12][`PROYECCION AÑO ${normalValueCount}`]
              ) +
              parseFloat(updatedData[20][`PROYECCION AÑO ${normalValueCount}`])
            ).toFixed(2);
          }
        }
      }

      setData(updatedData);
    }
  };

  // const handleColumnSelection = (e) => {
  //   const { name, value } = e.target;
  //   if (name === "horizontal" || name === "normalDistribution") {
  //     setSelectedColumns((prev) => [...prev, value].slice(-2));
  //   } else if (name === "vertical" || name === "tendencias") {
  //     setVerticalColumn(value);
  //   }
  // };

  //Nueva version
  const handleColumnSelection = (value) => {
    if (
      analysisType === "horizontal" ||
      analysisType === "normalDistribution"
    ) {
      setSelectedColumns((prev) => [...prev, value].slice(-2));
    } else if (analysisType === "vertical" || analysisType === "tendencias") {
      setVerticalColumn(value);
    }
  };

  //Version antigua
  // const handleRowSelection = (e, range, type) => {
  //   const { value } = e.target;
  //   setSelectedRows((prev) => ({
  //     ...prev,
  //     [range]: {
  //       ...prev[range],
  //       [type]: value,
  //     },
  //   }));
  // };

  //version nueva
  const handleRowSelection = (value, range, type) => {
    setSelectedRows((prev) => ({
      ...prev,
      [range]: {
        ...prev[range],
        [type]: value,
      },
    }));
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "analisis.xlsx");
  };

  const handleCellClick = (
    columnName,
    cellValue,
    firstCellValue,
    selectedColumns,
    verticalColumn
  ) => {
    let message = "";
    if (columnName === "ANALISIS VERTICAL") {
      message = `Según el análisis vertical, ${firstCellValue} representa el ${cellValue} del total del ${verticalColumn}.`;
    } else if (columnName === "VARIACION RELATIVA") {
      const [col1, col2] = selectedColumns;
      const changeType = cellValue > 0 ? "aumento" : "disminución";
      message = `Según el análisis horizontal, la cuenta ${firstCellValue} presentó un ${changeType} de ${cellValue} en el ${col1} con respecto al ${col2}.`;
    }
    setModalInfo({
      columnName,
      cellValue,
      message,
    });
    Modal.info({
      title: columnName,
      content: <div>{message}</div>,
      okText: "Cerrar", // Cambiar el texto del botón OK por Cerrar
      
      onOk() {},
    });
  };

  const handleAnalysisTypeChange = (value) => {
    setAnalysisType(value);
  };

  return (
    <div className="contenido-upload">
      <div className="contenido-superior">
        <div className="boton-subir">
          <Upload
            accept=".xlsx,.xls"
            beforeUpload={handleFileUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} className="subir-archivo">
              Cargar archivo Excel
            </Button>
          </Upload>
        </div>
        <Button type="primary" className="boton-atras">
          <Link to="/">Atrás</Link>
        </Button>
      </div>
      {data.length > 0 && (
        <div className="resultado-tabla">
          <div className="seleccionar-tipo-analisis">
            <Select
              placeholder="Seleccione un análisis"
              onChange={handleAnalysisTypeChange}
              className="seleccionar-tipo"
            >
              <Option value="horizontal">Análisis Horizontal</Option>
              <Option value="vertical">Análisis Vertical</Option>
              <Option value="verticalSubcuentas">
                Análisis Vertical Subcuentas
              </Option>
              <Option value="tendencias">
                Análisis de Tendencias con Año Base
              </Option>
              <Option value="normalDistribution">
                Proyeccion en base a años pasados
              </Option>
            </Select>
            <div className="botones-calcular-descargar">
              <Button
                type="primary"
                onClick={handleAnalysis}
                className="boton-realizar-analisis"
              >
                Realizar Análisis
              </Button>
              <Button
                onClick={handleDownload}
                icon={<DownloadOutlined />}
                className="boton-descargar"
              >
                Descargar Análisis
              </Button>
            </div>
          </div>
          {analysisType === "horizontal" && (
            <div>
              <Select
                placeholder="Seleccione la Columna 1"
                onChange={(value) => handleColumnSelection(value, "Columna 1")}
                className="horizontal-columna1"
              >
                {Object.keys(data[0]).map((key) => (
                  <Option key={key} value={key}>
                    {key}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Seleccione la Columna 2"
                className="horizontal-columna2"
                onChange={(value) => handleColumnSelection(value, "Columna 2")}
              >
                {Object.keys(data[0]).map((key) => (
                  <Option key={key} value={key}>
                    {key}
                  </Option>
                ))}
              </Select>
            </div>
          )}
          {analysisType === "vertical" && (
            <div>
              <Select
                placeholder="Seleccione la columna"
                onChange={handleColumnSelection}
                name="vertical"
                className="opcion-vertical"
              >
                {data &&
                  data.length > 0 &&
                  Object.keys(data[0]).map((key) => (
                    <Option key={key} value={key} name="vertical">
                      {key}
                    </Option>
                  ))}
              </Select>
            </div>
          )}
          {analysisType === "verticalSubcuentas" && (
            <div>
              <Select
                placeholder="Seleccione la columna"
                name="vertical"
                onChange={handleColumnSelection}
                style={{ width: 200, marginBottom: 10 }}
              >
                {Object.keys(data[0]).map((key) => (
                  <Option key={key} value={key} name="vertical">
                    {key}
                  </Option>
                ))}
              </Select>

              {["range1", "range2", "range3"].map((range) => (
                <div key={range} style={{ marginBottom: 10 }}>
                  <label>{`Rango ${range.slice(-1)}`}</label>
                  <Select
                    placeholder="Seleccione la fila de inicio"
                    onChange={(value) =>
                      handleRowSelection(value, range, "start")
                    }
                    className="selector-subcuentas"
                  >
                    {data.map((row, index) => (
                      <Option key={index} value={Object.values(row)[0]}>
                        {Object.values(row)[0]}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    placeholder="Seleccione la fila de fin"
                    onChange={(value) =>
                      handleRowSelection(value, range, "end")
                    }
                    className="selector-subcuentas2"
                  >
                    {data.map((row, index) => (
                      <Option key={index} value={Object.values(row)[0]}>
                        {Object.values(row)[0]}
                      </Option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          )}
          {analysisType === "tendencias" && (
            <Select
              placeholder="Seleccione la columna base"
              onChange={handleColumnSelection}
              name="vertical"
            >
              {data &&
                data.length > 0 &&
                Object.keys(data[0]).map((key) => (
                  <Select.Option key={key} value={key} name="vertical">
                    {key}
                  </Select.Option>
                ))}
            </Select>
          )}
          {analysisType === "normalDistribution" && (
            <div>
              <div className="seleccionar-columna-proyeccion">
                <Select
                  placeholder="Seleccione la Columna 1"
                  onChange={handleColumnSelection}
                  name="normalDistribution"
                  className="selector-proyeccion"
                >
                  {data &&
                    data.length > 0 &&
                    Object.keys(data[0]).map((key) => (
                      <Option key={key} value={key} name="normalDistribution">
                        {key}
                      </Option>
                    ))}
                </Select>
                <Select
                  placeholder="Seleccione la Columna 2"
                  onChange={handleColumnSelection}
                  name="normalDistribution"
                  className="selector-proyeccion segundo"
                >
                  {data &&
                    data.length > 0 &&
                    Object.keys(data[0]).map((key) => (
                      <Option key={key} value={key} name="normalDistribution">
                        {key}
                      </Option>
                    ))}
                </Select>
              </div>
              <label>Número de columnas de PROYECCION AÑO:</label>
              <InputNumber
                min={1}
                value={normalValueCount}
                onChange={(value) => setNormalValueCount(value || 1)}
                style={{ marginLeft: 20, marginRight: 20 }}
              />
              <label>Formato:</label>
              <Select
                value={format}
                onChange={(value) => setFormat(value)}
                style={{ width: 150, marginLeft: 20, marginTop: 10 }}
              >
                <Option value="formato1">Formato 1</Option>
                <Option value="formato2">Formato 2</Option>
              </Select>
            </div>
          )}
          <EditableTable
            data={data}
            setData={setData}
            selectedRows={selectedRows}
            verticalColumn={verticalColumn}
            selectedColumns={selectedColumns}
            onCellClick={handleCellClick}
          />
        </div>
      )}

      {modalInfo && (
        <Modal onClose={() => setModalInfo(null)}>
          {console.log("modal ", modalInfo)}
          <h2>{modalInfo.columnName}</h2>
          <p>{modalInfo.message}</p>
        </Modal>
      )}
    </div>
  );
}

export default UploadFile;
