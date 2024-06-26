import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import EditableTable from "./EditableTable";
import { Link } from "react-router-dom";
import "./Upload.css";
import Modal from "./Modal";

function UploadFile() {
  const [data, setData] = useState([]);
  const [analysisType, setAnalysisType] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [verticalColumn, setVerticalColumn] = useState(null);
  const [selectedRows, setSelectedRows] = useState({
    range1: { start: null, end: null },
    range2: { start: null, end: null },
    range3: { start: null, end: null }
  });
  const [normalValueCount, setNormalValueCount] = useState(1);
  const [format, setFormat] = useState("formato1");
  const [modalInfo, setModalInfo] = useState(null);

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setData(parsedData);
    };
  };

  const handleAnalysis = () => {
    if (analysisType === "horizontal" && selectedColumns.length === 2) {
      const [col1, col2] = selectedColumns;
      const updatedData = data.map((row) => {
        const varAbs = row[col2] - row[col1];
        const varRel = (varAbs / row[col1]) * 100;
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
        const analysisVertical = ((row[verticalColumn]) / lastRowValue) * 100;
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
            const endRowValue = data.find((r) => r[Object.keys(data[0])[0]] === end)[verticalColumn];
            if (rowIndex >= data.findIndex((r) => r[Object.keys(data[0])[0]] === start) && rowIndex <= data.findIndex((r) => r[Object.keys(data[0])[0]] === end) && endRowValue !== 0) {
              analysisVerticalSubcuentas = (row[verticalColumn] / endRowValue) * 100;
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
            newRow[`AT:${key}`] = (row[key] / baseValue) * 100;
          }
        });
        return newRow;
      });
      setData(updatedData);
    } else if (analysisType === "normalDistribution" && selectedColumns.length === 2) {
      const colIndices = selectedColumns.map((col) => Object.keys(data[0]).indexOf(col));
      const [startIndex, endIndex] = colIndices.sort((a, b) => a - b);

      let updatedData = data.map((row) => {
        const values = Object.keys(row).slice(startIndex, endIndex + 1).map((key) => parseFloat(row[key]));
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
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
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData.slice(0, 5).reduce((sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`], 0).toFixed(2);
          } else if (i === 12) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData.slice(6, 12).reduce((sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`], 0).toFixed(2);
          } else if (i === 18) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData.slice(13, 18).reduce((sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`], 0).toFixed(2);
          } else if (i === 19) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (parseFloat(updatedData[5][`PROYECCION AÑO ${normalValueCount}`]) + parseFloat(updatedData[12][`PROYECCION AÑO ${normalValueCount}`]) + parseFloat(updatedData[18][`PROYECCION AÑO ${normalValueCount}`])).toFixed(2);
          }
        }
      } else if (format === "formato2") {
        for (let i = 0; i < updatedData.length; i++) {
          if (i === 1) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData.slice(2, 7).reduce((sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`], 0).toFixed(2);
          } else if (i === 7) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData.slice(8, 11).reduce((sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`], 0).toFixed(2);
          } else if (i === 12) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData.slice(14, 17).reduce((sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`], 0).toFixed(2);
          }  else if (i === 20) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = updatedData.slice(21, 25).reduce((sum, row) => sum + row[`PROYECCION AÑO ${normalValueCount}`], 0).toFixed(2);
          } 
        }
        for (let i = 0; i < updatedData.length; i++) {
          if (i === 0) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (parseFloat(updatedData[1][`PROYECCION AÑO ${normalValueCount}`]) + parseFloat(updatedData[7][`PROYECCION AÑO ${normalValueCount}`])).toFixed(2);
          } else if (i === 13) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (parseFloat(updatedData[14][`PROYECCION AÑO ${normalValueCount}`]) + parseFloat(updatedData[18][`PROYECCION AÑO ${normalValueCount}`])).toFixed(2);
          } else if (i === 17) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (parseFloat(updatedData[18][`PROYECCION AÑO ${normalValueCount}`]) + parseFloat(updatedData[19][`PROYECCION AÑO ${normalValueCount}`])).toFixed(2);
          }  
        }
        for (let i = updatedData.length; i > 0; i--) {
          if (i === 12) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (parseFloat(updatedData[13][`PROYECCION AÑO ${normalValueCount}`]) + parseFloat(updatedData[17][`PROYECCION AÑO ${normalValueCount}`])).toFixed(2);
          } else if (i === 11) {
            updatedData[i][`PROYECCION AÑO ${normalValueCount}`] = (parseFloat(updatedData[12][`PROYECCION AÑO ${normalValueCount}`]) + parseFloat(updatedData[20][`PROYECCION AÑO ${normalValueCount}`])).toFixed(2);
          }
        }
      }

      setData(updatedData);
    }
  };

  const handleColumnSelection = (e) => {
    const { name, value } = e.target;
    if (name === "horizontal" || name === "normalDistribution") {
      setSelectedColumns((prev) => [...prev, value].slice(-2));
    } else if (name === "vertical" || name === "tendencias") {
      setVerticalColumn(value);
    }
  };

  const handleRowSelection = (e, range, type) => {
    const { value } = e.target;
    setSelectedRows((prev) => ({
      ...prev,
      [range]: {
        ...prev[range],
        [type]: value
      }
    }));
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "analisis.xlsx");
  };

  const handleCellClick = (columnName, cellValue, firstCellValue, selectedColumns, verticalColumn) => {
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
      message
    });
  };

  return (
    <div className="contenido-upload">
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
      />
      <br/>
      <button>
        <Link to="/">atras</Link>
      </button>
      {data.length > 0 && (
        <div className="resultado-tabla">
          <select onChange={(e) => setAnalysisType(e.target.value)}>
            <option value="">Seleccione un análisis</option>
            <option value="horizontal">Análisis Horizontal</option>
            <option value="vertical">Análisis Vertical</option>
            <option value="verticalSubcuentas">Análisis Vertical Subcuentas</option>
            <option value="tendencias">Análisis de Tendencias con Año Base</option>
            <option value="normalDistribution">Proyeccion en base a años pasados</option>
          </select>
          {analysisType === "horizontal" && (
            <>
              <select name="horizontal" onChange={handleColumnSelection}>
                <option value="">Seleccione la Columna 1</option>
                {Object.keys(data[0]).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <select name="horizontal" onChange={handleColumnSelection}>
                <option value="">Seleccione la Columna 2</option>
                {Object.keys(data[0]).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </>
          )}
          {analysisType === "vertical" && (
            <select name="vertical" onChange={handleColumnSelection}>
              <option value="">Seleccione la columna</option>
              {Object.keys(data[0]).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          )}
          {analysisType === "verticalSubcuentas" && (
            <>
              <select name="vertical" onChange={handleColumnSelection}>
                <option value="">Seleccione la columna</option>
                {Object.keys(data[0]).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              {["range1", "range2", "range3"].map((range) => (
                <div key={range}>
                  <label>{`Rango ${range.slice(-1)}`}</label>
                  <select onChange={(e) => handleRowSelection(e, range, "start")}>
                    <option value="">Seleccione la fila inicial</option>
                    {data.map((row, index) => (
                      <option key={index} value={Object.values(row)[0]}>
                        {Object.values(row)[0]}
                      </option>
                    ))}
                  </select>
                  <select onChange={(e) => handleRowSelection(e, range, "end")}>
                    <option value="">Seleccione la fila final</option>
                    {data.map((row, index) => (
                      <option key={index} value={Object.values(row)[0]}>
                        {Object.values(row)[0]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </>
          )}
          {analysisType === "tendencias" && (
            <select name="tendencias" onChange={handleColumnSelection}>
              <option value="">Seleccione la columna base</option>
              {Object.keys(data[0]).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          )}
          {analysisType === "normalDistribution" && (
            <>
              <select name="normalDistribution" onChange={handleColumnSelection}>
                <option value="">Seleccione la Columna 1</option>
                {Object.keys(data[0]).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <select name="normalDistribution" onChange={handleColumnSelection}>
                <option value="">Seleccione la Columna 2</option>
                {Object.keys(data[0]).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <label>Número de columnas de PROYECCION AÑO:</label>
              <input 
                type="number" 
                min="1" 
                value={normalValueCount} 
                onChange={(e) => setNormalValueCount(parseInt(e.target.value) || 1)} 
              />
              <label>Formato:</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="formato1">Formato 1</option>
                <option value="formato2">Formato 2</option>
              </select>
            </>
          )}
          <button onClick={handleAnalysis}>Realizar Análisis</button>
          <button onClick={handleDownload}>Descargar Excel</button>
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
          <h2>{modalInfo.columnName}</h2>
          <p>{modalInfo.message}</p>
        </Modal>
      )}
      <br /><br />
    </div>
  );
}

export default UploadFile;
