import React from "react";
import "./EditableTable.css";

function EditableTable({ data, setData, selectedRows, verticalColumn }) {
  const columns = Object.keys(data[0]);

  const handleInputChange = (e, rowIndex, key) => {
    const { value } = e.target;
    const updatedData = [...data];
    updatedData[rowIndex][key] = value;

    if (columns.includes("VARIACION ABSOLUTA") && columns.includes("VARIACION RELATIVA")) {
      const [col1, col2] = columns.slice(0, 2); 
      const varAbs = updatedData[rowIndex][col2] - updatedData[rowIndex][col1];
      const varRel = (varAbs / updatedData[rowIndex][col1]) * 100;
      updatedData[rowIndex]["VARIACION ABSOLUTA"] = varAbs;
      updatedData[rowIndex]["VARIACION RELATIVA"] = varRel;
    }
    if (columns.includes("ANALISIS VERTICAL")) {
      const lastRowValue = data[data.length - 1][verticalColumn]; 
      updatedData[rowIndex]["ANALISIS VERTICAL"] = ((updatedData[rowIndex][verticalColumn] - lastRowValue) / lastRowValue) * 100;
    }
    if (columns.includes("ANALISIS VERTICAL SUBCUENTAS")) {
      let analysisVerticalSubcuentas = 0;
      for (const range in selectedRows) {
        const { start, end } = selectedRows[range]; 
        if (start !== null && end !== null) {
          const endRowValue = data.find((row) => row[Object.keys(data[0])[0]] === end)[verticalColumn];
          if (updatedData[rowIndex][Object.keys(data[0])[0]] >= start && updatedData[rowIndex][Object.keys(data[0])[0]] <= end && endRowValue !== 0) {
            analysisVerticalSubcuentas = (updatedData[rowIndex][verticalColumn] / endRowValue) * 100;
            break;  
          }
        }
      }
      updatedData[rowIndex]["ANALISIS VERTICAL SUBCUENTAS"] = analysisVerticalSubcuentas;
    }

    setData(updatedData);
  };

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((key, colIndex) => (
              <td key={colIndex}>
                {key.startsWith("VARIACION") || key.startsWith("ANALISIS") || key.startsWith("AT:") || key === "Ratio de liquidez" || key === "Ratio de solvencia" ? (
                  row[key]
                ) : (
                  <input
                    type="text"
                    value={row[key]}
                    onChange={(e) => handleInputChange(e, rowIndex, key)}
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default EditableTable;
