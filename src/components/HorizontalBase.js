import React, { useState } from 'react';
import './HorizontalBase.css';
import * as XLSX from 'xlsx';


const HorizontalBase = () => {
  const [data, setData] = useState({
    activos: {
      activosCorrientes: [{ nombre: 'Disponibilidades', valores: [750, 720, 820, 900, 940] }, { nombre: 'Inversiones Temporales', valores: [350, 345, 360, 350, 355] }, { nombre: 'Cuentas por Cobrar', valores: [2275, 2050, 2100, 2150, 2100] }, { nombre: 'Inventarios', valores: [2300, 2500, 2420, 2480, 2450] }, { nombre: 'Otros Activos Corrientes', valores: [670, 595, 405, 585, 690] }],
      activosNoCorrientes: [{ nombre: 'Activos Fijos Netos', valores: [1940, 1985, 2200, 2250, 2360] }, { nombre: 'Inversiones Permanentes', valores: [150, 490, 195, 170, 160] }, { nombre: 'Otros Activos No Corrientes', valores: [90, 100, 113, 145, 165] }],
    },
    pasivosYPatrimonio: {
      pasivos: {
        pasivosCortoPlazo: [{ nombre: 'Cuentas por Pagar', valores: [1200, 1400, 1350, 2633, 1683] }, { nombre: 'Otras Cuentas por Pagar', valores: [750, 600, 500, 450, 670] }, { nombre: 'Prestamos Bancarios a CP', valores: [150, 120, 100, 150, 140] }],
        pasivosLargoPlazo: [{ nombre: 'Prestamos Bancarios', valores: [450, 380, 300, 240, 450] }, { nombre: 'Bonos por Pagar', valores: [300, 300, 300, 300, 300] }],
      },
      patrimonio: [{ nombre: 'Capital Social', valores: [1800, 1800, 1800, 1800, 1800] }, { nombre: 'Reservas y Ajustes de Capital', valores: [65, 70, 85, 110, 120] }, { nombre: 'Resultado Acumulado', valores: [1440, 1305, 1600, 1153, 1337] }, { nombre: 'Resultado de la Gestion', valores: [2370, 2810, 2578, 2194, 2720] }],
    },
    years: [2013, 2014, 2015, 2016, 2017],
  });

  const [percentages, setPercentages] = useState(null);

  const handleChange = (section, subSection, index, yearIndex, value) => {
    const newData = { ...data };
    if (subSection.includes('.')) {
      const [mainSection, subSubSection] = subSection.split('.');
      newData[section][mainSection][subSubSection][index].valores[yearIndex] = parseFloat(value);
    } else {
      newData[section][subSection][index].valores[yearIndex] = parseFloat(value);
    }
    setData(newData);
  };

  const handleNameChange = (section, subSection, index, value) => {
    const newData = { ...data };
    if (subSection.includes('.')) {
      const [mainSection, subSubSection] = subSection.split('.');
      newData[section][mainSection][subSubSection][index].nombre = value;
    } else {
      newData[section][subSection][index].nombre = value;
    }
    setData(newData);
  };

  const addRow = (section, subSection) => {
    const newData = { ...data };
    const newYearValues = new Array(data.years.length).fill(0);
    if (subSection.includes('.')) {
      const [mainSection, subSubSection] = subSection.split('.');
      newData[section][mainSection][subSubSection].push({ nombre: `Cuenta ${newData[section][mainSection][subSubSection].length + 1}`, valores: newYearValues });
    } else {
      newData[section][subSection].push({ nombre: `Cuenta ${newData[section][subSection].length + 1}`, valores: newYearValues });
    }
    setData(newData);
  };

  const addYear = () => {
    const newData = { ...data };
    newData.years.push(newData.years[newData.years.length - 1] + 1);
    Object.keys(newData.activos).forEach((key) => {
      newData.activos[key] = newData.activos[key].map(item => ({
        ...item,
        valores: [...item.valores, 0],
      }));
    });
    Object.keys(newData.pasivosYPatrimonio.pasivos).forEach((subKey) => {
      newData.pasivosYPatrimonio.pasivos[subKey] = newData.pasivosYPatrimonio.pasivos[subKey].map(item => ({
        ...item,
        valores: [...item.valores, 0],
      }));
    });
    newData.pasivosYPatrimonio.patrimonio = newData.pasivosYPatrimonio.patrimonio.map(item => ({
      ...item,
      valores: [...item.valores, 0],
    }));
    setData(newData);
  };

  const calculateSum = (arr, yearIndex) => arr.reduce((sum, item) => sum + Number(item.valores[yearIndex]), 0);

  const calculatePercentages = () => {
    const newPercentages = JSON.parse(JSON.stringify(data));
    const baseYearIndex = 0;

    Object.keys(newPercentages.activos).forEach((key) => {
      newPercentages.activos[key] = newPercentages.activos[key].map(item => ({
        ...item,
        valores: item.valores.map((value, index) => index === baseYearIndex ? 100 : (value / item.valores[baseYearIndex] * 100).toFixed(2)),
      }));
    });

    Object.keys(newPercentages.pasivosYPatrimonio.pasivos).forEach((key) => {
      newPercentages.pasivosYPatrimonio.pasivos[key] = newPercentages.pasivosYPatrimonio.pasivos[key].map(item => ({
        ...item,
        valores: item.valores.map((value, index) => index === baseYearIndex ? 100 : (value / item.valores[baseYearIndex] * 100).toFixed(2)),
      }));
    });
    newPercentages.pasivosYPatrimonio.patrimonio = newPercentages.pasivosYPatrimonio.patrimonio.map(item => ({
      ...item,
      valores: item.valores.map((value, index) => index === baseYearIndex ? 100 : (value / item.valores[baseYearIndex] * 100).toFixed(2)),
    }));

    newPercentages.activos.totalActivos = data.years.map((_, yearIndex) => {
      const totalActivosCorrientes = calculateSum(data.activos.activosCorrientes, yearIndex);
      const totalActivosNoCorrientes = calculateSum(data.activos.activosNoCorrientes, yearIndex);
      const totalActivos = totalActivosCorrientes + totalActivosNoCorrientes;

      const baseYearIndex = 0;
      const baseTotalActivosCorrientes = calculateSum(data.activos.activosCorrientes, baseYearIndex);
      const baseTotalActivosNoCorrientes = calculateSum(data.activos.activosNoCorrientes, baseYearIndex);
      const baseTotalActivos = baseTotalActivosCorrientes + baseTotalActivosNoCorrientes;

      console.log("BaseTotalActivos:", baseTotalActivos);
      return yearIndex === baseYearIndex ? 100 : (totalActivos / baseTotalActivos * 100).toFixed(2);
    });


    newPercentages.activos.totalActivosCorrientes = data.years.map((_, yearIndex) => {
      const total = calculateSum(data.activos.activosCorrientes, yearIndex);
      const baseTotal = calculateSum(data.activos.activosCorrientes, baseYearIndex);
      return yearIndex === baseYearIndex ? 100 : (total / baseTotal * 100).toFixed(2);
    });

    newPercentages.activos.totalActivosNoCorrientes = data.years.map((_, yearIndex) => {
      const total = calculateSum(data.activos.activosNoCorrientes, yearIndex);
      const baseTotal = calculateSum(data.activos.activosNoCorrientes, baseYearIndex);
      return yearIndex === baseYearIndex ? 100 : (total / baseTotal * 100).toFixed(2);
    });

    newPercentages.pasivosYPatrimonio.totalPasivos = data.years.map((_, yearIndex) => {
      const totalPasivosCortoPlazo = calculateSum(data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo, yearIndex);
      const totalPasivosLargoPlazo = calculateSum(data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo, yearIndex);
      const totalPasivos = totalPasivosCortoPlazo + totalPasivosLargoPlazo;

      const baseYearIndex = 0;
      const baseTotalPasivosCortoPlazo = calculateSum(data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo, baseYearIndex);
      const baseTotalPasivosLargoPlazo = calculateSum(data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo, baseYearIndex);
      const baseTotalPasivos = baseTotalPasivosCortoPlazo + baseTotalPasivosLargoPlazo;
      return yearIndex === baseYearIndex ? 100 : (totalPasivos / baseTotalPasivos * 100).toFixed(2);
    });


    newPercentages.pasivosYPatrimonio.totalPasivosCortoPlazo = data.years.map((_, yearIndex) => {
      const total = calculateSum(data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo, yearIndex);
      const baseTotal = calculateSum(data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo, baseYearIndex);
      return yearIndex === baseYearIndex ? 100 : (total / baseTotal * 100).toFixed(2);
    });

    newPercentages.pasivosYPatrimonio.totalPasivosLargoPlazo = data.years.map((_, yearIndex) => {
      const total = calculateSum(data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo, yearIndex);
      const baseTotal = calculateSum(data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo, baseYearIndex);
      return yearIndex === baseYearIndex ? 100 : (total / baseTotal * 100).toFixed(2);
    });

    newPercentages.pasivosYPatrimonio.totalPatrimonio = data.years.map((_, yearIndex) => {
      const total = calculateSum(data.pasivosYPatrimonio.patrimonio, yearIndex);
      const baseTotal = calculateSum(data.pasivosYPatrimonio.patrimonio, baseYearIndex);
      return yearIndex === baseYearIndex ? 100 : (total / baseTotal * 100).toFixed(2);
    });

    newPercentages.pasivosYPatrimonio.totalPasivosYPatrimonio = data.years.map((_, yearIndex) => {
      const totalPasivos = calculateSum(data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo, yearIndex) +
        calculateSum(data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo, yearIndex);
      const totalPatrimonio = calculateSum(data.pasivosYPatrimonio.patrimonio, yearIndex);
      const totalPasivosYPatrimonio = totalPasivos + totalPatrimonio;
      const baseTotalPasivos = calculateSum(data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo, baseYearIndex) +
        calculateSum(data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo, baseYearIndex) +
        calculateSum(data.pasivosYPatrimonio.patrimonio, baseYearIndex);

      return yearIndex === baseYearIndex ? 100 : (totalPasivosYPatrimonio / baseTotalPasivos * 100).toFixed(2);
    });

    setPercentages(newPercentages);
  };


  const simulateNextYear = () => {
    const newData = { ...data };
    const lastYearIndex = newData.years.length - 1;
    const newYear = newData.years[lastYearIndex] + 1;

    // Añadir un nuevo año
    newData.years.push(newYear);

    // Función para calcular la media
    const calculateMean = (values) => {
      const sum = values.reduce((a, b) => a + b, 0);
      return (sum / values.length).toFixed(2);
    };

    // Función para calcular la desviación estándar
    const calculateStdDev = (values, mean) => {
      const squareDiffs = values.map(value => Math.pow(value - mean, 2));
      const avgSquareDiff = calculateMean(squareDiffs);
      return Math.sqrt(avgSquareDiff).toFixed(2);
    };

    // Función para generar números aleatorios con distribución normal
    const getRandomNormal = (mean, stdDev) => {
      let u1 = Math.random();
      let u2 = Math.random();
      let randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
      return (mean + stdDev * randStdNormal).toFixed(2);
    };

    const simulateValues = (items) => {
      return items.map(item => {
        const mean = parseFloat(calculateMean(item.valores));
        const stdDev = parseFloat(calculateStdDev(item.valores, mean));
        const simulatedValue = parseFloat(getRandomNormal(mean, stdDev));
        return {
          ...item,
          valores: [...item.valores, Math.max(simulatedValue, 0)]
        };
      });
    };

    newData.activos.activosCorrientes = simulateValues(newData.activos.activosCorrientes);
    newData.activos.activosNoCorrientes = simulateValues(newData.activos.activosNoCorrientes);
    newData.pasivosYPatrimonio.pasivos.pasivosCortoPlazo = simulateValues(newData.pasivosYPatrimonio.pasivos.pasivosCortoPlazo);
    newData.pasivosYPatrimonio.pasivos.pasivosLargoPlazo = simulateValues(newData.pasivosYPatrimonio.pasivos.pasivosLargoPlazo);
    newData.pasivosYPatrimonio.patrimonio = simulateValues(newData.pasivosYPatrimonio.patrimonio);

    setData(newData);
  };
  const saveToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet([]);
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    // Headers
    const headers = ["Section", "Sub Section", "Name", ...data.years];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

    // Data
    const addRowsToSheet = (section, subSection, items) => {
      items.forEach((item, index) => {
        const row = [section, subSection, item.nombre, ...item.valores];
        XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: `A${range.e.r + 2 + index}` });
      });
    };

    // Add Activos
    addRowsToSheet("Activos", "Activos Corrientes", data.activos.activosCorrientes);
    addRowsToSheet("Activos", "Activos No Corrientes", data.activos.activosNoCorrientes);

    // Add Pasivos
    addRowsToSheet("Pasivos", "Pasivos Corto Plazo", data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo);
    addRowsToSheet("Pasivos", "Pasivos Largo Plazo", data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo);

    // Add Patrimonio
    addRowsToSheet("Patrimonio", "", data.pasivosYPatrimonio.patrimonio);

    // Add Totals
    XLSX.utils.sheet_add_aoa(worksheet, [["Activos", "", "Total Activos", ...data.years.map((_, yearIndex) => percentages.activos.totalActivos[yearIndex])]], { origin: `A${worksheet['!ref'].split(":")[1].slice(1)}+2` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Activos", "", "Total Activos Corrientes", ...data.years.map((_, yearIndex) => percentages.activos.totalActivosCorrientes[yearIndex])]], { origin: `A${worksheet['!ref'].split(":")[1].slice(1)}+3` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Activos", "", "Total Activos No Corrientes", ...data.years.map((_, yearIndex) => percentages.activos.totalActivosNoCorrientes[yearIndex])]], { origin: `A${worksheet['!ref'].split(":")[1].slice(1)}+4` });

    XLSX.utils.sheet_add_aoa(worksheet, [["Pasivos y Patrimonio", "", "Total Pasivos", ...data.years.map((_, yearIndex) => percentages.pasivosYPatrimonio.totalPasivos[yearIndex])]], { origin: `A${worksheet['!ref'].split(":")[1].slice(1)}+5` });
    XLSX.utils.sheet_add_aoa(worksheet, [["Pasivos y Patrimonio", "", "Total Patrimonio", ...data.years.map((_, yearIndex) => percentages.pasivosYPatrimonio.totalPatrimonio[yearIndex])]], { origin: `A${worksheet['!ref'].split(":")[1].slice(1)}+6` });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "financial_data.xlsx");
  };



  return (
    <div className="App">
      <table>
        <thead>
          <tr>
            <th>Cuentas</th>
            {data.years.map((year) => (
              <th key={year}>{year}</th>
            ))}
            <th>
              <button onClick={addYear}>Agregar año</button>
              <button onClick={simulateNextYear}>proyeccion Próximo Año</button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Total Activos</th>
            {data.years.map((_, yearIndex) => (
              <th key={yearIndex}>{calculateSum(data.activos.activosCorrientes, yearIndex) + calculateSum(data.activos.activosNoCorrientes, yearIndex)}</th>
            ))}
          </tr>
          <tr>
            <th>Activos Corrientes</th>
            {data.years.map((_, yearIndex) => (
              <th key={yearIndex}>{calculateSum(data.activos.activosCorrientes, yearIndex)}</th>
            ))}
          </tr>

          {data.activos.activosCorrientes.map((item, index) => (
            <tr key={index}>
              <td>
                <input type="text" value={item.nombre} onChange={(e) => handleNameChange('activos', 'activosCorrientes', index, e.target.value)} />
              </td>
              {item.valores.map((value, yearIndex) => (
                <td key={yearIndex}>
                  <input type="number" value={value} onChange={(e) => handleChange('activos', 'activosCorrientes', index, yearIndex, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>
              <button onClick={() => addRow('activos', 'activosCorrientes')}>Agregar otra subcuenta</button>
            </td>
          </tr>
          <tr>
            <th> Activos No Corrientes</th>
            {data.years.map((_, yearIndex) => (
              <th key={yearIndex}>{calculateSum(data.activos.activosNoCorrientes, yearIndex)}</th>
            ))}
          </tr>
          {data.activos.activosNoCorrientes.map((item, index) => (
            <tr key={index}>
              <td>
                <input type="text" value={item.nombre} onChange={(e) => handleNameChange('activos', 'activosNoCorrientes', index, e.target.value)} />
              </td>
              {item.valores.map((value, yearIndex) => (
                <td key={yearIndex}>
                  <input type="number" value={value} onChange={(e) => handleChange('activos', 'activosNoCorrientes', index, yearIndex, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>
              <button onClick={() => addRow('activos', 'activosNoCorrientes')}>Agregar otra subcuenta</button>
            </td>
          </tr>
          <tr>
            <th>Total Pasivos y Patrimonio</th>
            {data.years.map((_, yearIndex) => (
              <th key={yearIndex}>{calculateSum(data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo, yearIndex) + calculateSum(data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo, yearIndex) + calculateSum(data.pasivosYPatrimonio.patrimonio, yearIndex)}</th>
            ))}
          </tr>
          <tr>
            <th>Total Pasivos</th>
            {data.years.map((_, yearIndex) => (
              <th key={yearIndex}>{calculateSum(data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo, yearIndex) + calculateSum(data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo, yearIndex)}</th>
            ))}
          </tr>
          <tr>
            <th> Pasivos Corto Plazo</th>
            {data.years.map((_, yearIndex) => (
              <th key={yearIndex}>{calculateSum(data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo, yearIndex)}</th>
            ))}
          </tr>
          {data.pasivosYPatrimonio.pasivos.pasivosCortoPlazo.map((item, index) => (
            <tr key={index}>
              <td>
                <input type="text" value={item.nombre} onChange={(e) => handleNameChange('pasivosYPatrimonio', 'pasivos.pasivosCortoPlazo', index, e.target.value)} />
              </td>
              {item.valores.map((value, yearIndex) => (
                <td key={yearIndex}>
                  <input type="number" value={value} onChange={(e) => handleChange('pasivosYPatrimonio', 'pasivos.pasivosCortoPlazo', index, yearIndex, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>
              <button onClick={() => addRow('pasivosYPatrimonio', 'pasivos.pasivosCortoPlazo')}>Agregar otra subcuenta</button>
            </td>
          </tr>
          <tr>
            <th>Total Pasivos Largo Plazo</th>
            {data.years.map((_, yearIndex) => (
              <th key={yearIndex}>{calculateSum(data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo, yearIndex)}</th>
            ))}
          </tr>
          {data.pasivosYPatrimonio.pasivos.pasivosLargoPlazo.map((item, index) => (
            <tr key={index}>
              <td>
                <input type="text" value={item.nombre} onChange={(e) => handleNameChange('pasivosYPatrimonio', 'pasivos.pasivosLargoPlazo', index, e.target.value)} />
              </td>
              {item.valores.map((value, yearIndex) => (
                <td key={yearIndex}>
                  <input type="number" value={value} onChange={(e) => handleChange('pasivosYPatrimonio', 'pasivos.pasivosLargoPlazo', index, yearIndex, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>
              <button onClick={() => addRow('pasivosYPatrimonio', 'pasivos.pasivosLargoPlazo')}>Agregar otra subcuenta</button>
            </td>
          </tr>
          <tr>
            <th> Patrimonio</th>
            {data.years.map((_, yearIndex) => (
              <th key={yearIndex}>{calculateSum(data.pasivosYPatrimonio.patrimonio, yearIndex)}</th>
            ))}
          </tr>
          {data.pasivosYPatrimonio.patrimonio.map((item, index) => (
            <tr key={index}>
              <td>
                <input type="text" value={item.nombre} onChange={(e) => handleNameChange('pasivosYPatrimonio', 'patrimonio', index, e.target.value)} />
              </td>
              {item.valores.map((value, yearIndex) => (
                <td key={yearIndex}>
                  <input type="number" value={value} onChange={(e) => handleChange('pasivosYPatrimonio', 'patrimonio', index, yearIndex, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>
              <button onClick={() => addRow('pasivosYPatrimonio', 'patrimonio')}>Agregar otra subcuenta</button>
            </td>
          </tr>

        </tbody>
      </table>
      <button onClick={calculatePercentages}>Calcular tendencia</button>
      {percentages && (
        <div>
          <h2>analisis tendencia con base año 2013</h2>
          <table>
            <thead>
              <tr>
                <th>Cuentas</th>
                {percentages.years.map((year) => (
                  <th key={year}>{year}</th>
                ))}
              </tr>
            </thead>
            <tbody>

              <tr>
                <th>Total Activos</th>
                {percentages.activos.totalActivos.map((value, index) => (
                  <td key={index}>{value}%</td>
                ))}
              </tr>

              <tr>
                <th>Activos Corrientes</th>
                {percentages.activos.totalActivosCorrientes.map((value, index) => (
                  <td key={index}>{value}%</td>
                ))}
              </tr>
              {percentages.activos.activosCorrientes.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre}</td>
                  {item.valores.map((value, yearIndex) => (
                    <td key={yearIndex}>{value}%</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th>Activos No Corrientes</th>
                {percentages.activos.totalActivosNoCorrientes.map((value, index) => (
                  <td key={index}>{value}%</td>
                ))}
              </tr>
              {percentages.activos.activosNoCorrientes.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre}</td>
                  {item.valores.map((value, yearIndex) => (
                    <td key={yearIndex}>{value}%</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th>Pasivos y Patrimonio</th>
                {percentages.pasivosYPatrimonio.totalPasivosYPatrimonio.map((value, index) => (
                  <td key={index}>{value}%</td>
                ))}
              </tr>


              <tr>
                <th>Pasivos </th>
                {percentages.pasivosYPatrimonio.totalPasivos.map((value, index) => (
                  <td key={index}>{value}%</td>
                ))}
              </tr>
              <tr>
                <th>Pasivos Corto Plazo</th>
                {percentages.pasivosYPatrimonio.totalPasivosCortoPlazo.map((value, index) => (
                  <td key={index}>{value}%</td>
                ))}
              </tr>
              {percentages.pasivosYPatrimonio.pasivos.pasivosCortoPlazo.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre}</td>
                  {item.valores.map((value, yearIndex) => (
                    <td key={yearIndex}>{value}%</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th>Pasivos Largo Plazo</th>
                {percentages.pasivosYPatrimonio.totalPasivosLargoPlazo.map((value, index) => (
                  <td key={index}>{value}%</td>
                ))}
              </tr>
              {percentages.pasivosYPatrimonio.pasivos.pasivosLargoPlazo.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre}</td>
                  {item.valores.map((value, yearIndex) => (
                    <td key={yearIndex}>{value}%</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th>Patrimonio</th>
                {percentages.pasivosYPatrimonio.totalPatrimonio.map((value, index) => (
                  <td key={index}>{value}%</td>
                ))}
              </tr>
              {percentages.pasivosYPatrimonio.patrimonio.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre}</td>
                  {item.valores.map((value, yearIndex) => (
                    <td key={yearIndex}>{value}%</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={saveToExcel}>Guardar en Excel</button>

        </div>
      )}
    </div>
  );
};

export default HorizontalBase;
