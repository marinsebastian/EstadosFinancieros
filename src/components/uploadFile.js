import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import EditableTable from "./EditableTable";
import { Link } from "react-router-dom";


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
    }
  };

  const handleColumnSelection = (e) => {
    const { name, value } = e.target;
    if (name === "horizontal") {
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

  return (
    <div className="App">
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
        <div>
          <select onChange={(e) => setAnalysisType(e.target.value)}>
            <option value="">Seleccione un análisis</option>
            <option value="horizontal">Análisis Horizontal</option>
            <option value="vertical">Análisis Vertical</option>
            <option value="verticalSubcuentas">Análisis Vertical Subcuentas</option>
            <option value="tendencias">Análisis de Tendencias con Año Base</option>
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
          <button onClick={handleAnalysis}>Realizar Análisis</button>
          <button onClick={handleDownload}>Descargar Excel</button>
          <EditableTable data={data} setData={setData} selectedRows={selectedRows} verticalColumn={verticalColumn} />
        </div>
      )}
      <br /><br />
    </div>
  );
}

export default UploadFile;
