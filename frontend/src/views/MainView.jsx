import BaseGraph from "../components/graficos/BaseGraph";
import SettingsForm from "../components/settings/SettingsFrom";
import Comment from "../components/utiles/Comment";
import api from "../utils/api";

import { useState, useEffect } from "react";

const MainView = () => {
  const ESP1 = "oli";
  const ESP2 = "ola";
  const cols = [
    "batt_level",
    "temp",
    "press",
    "hum",
    "co",
    "rms",
    "amp_x",
    "amp_y",
    "amp_z",
    "frec_x",
    "frec_y",
    "frec_z",
  ]
  let datos = [
    {
      title: "batt_level",
      data: [],
    },
    {
      title: "hum",
      data: [],
    },
    {
      title: "temp",
      data: [],
    },
    {
      title: "co",
      data: [],
    },
    {
      title: "pres",
      data: [],
    },
  ];

  let p3_frec_data = [
    {
      title: "frec_x",
      data: [],
    },
    {
      title: "frec_y",
      data: [],
    },
    {
      title: "frec_z",
      data: [],
    },
  ]

  let p3_amp_data = [
    {
      title: "rms",
      data: [],
    },
    {
      title: "amp_x",
      data: [],
    },
    {
      title: "amp_y",
      data: [],
    },
    {
      title: "amp_z",
      data: [],
    },
  ]
  let datos2 = [
    {
      title: "batt_level",
      data: [],
    },
    {
      title: "hum",
      data: [],
    },
    {
      title: "temp",
      data: [],
    },
    {
      title: "co",
      data: [],
    },
    {
      title: "pres",
      data: [],
    },
  ];

  let p3_frec_data2 = [
    {
      title: "frec_x",
      data: [],
    },
    {
      title: "frec_y",
      data: [],
    },
    {
      title: "frec_z",
      data: [],
    },
  ]

  let p3_amp_data2 = [
    {
      title: "rms",
      data: [],
    },
    {
      title: "amp_x",
      data: [],
    },
    {
      title: "amp_y",
      data: [],
    },
    {
      title: "amp_z",
      data: [],
    },
  ]
  
  const [configData, setConfigData] = useState();
  const [data, setData] = useState({[ESP1]: [], [ESP2]: []});
  const [p3_frec, setP3FrecData] = useState({[ESP1]: [], [ESP2]: []});
  const [p3_amp, setP3AmpData] = useState({[ESP1]: [], [ESP2]: []});
  const [idDevice, setIdDevice] = useState(ESP1);
  

  useEffect(() => {
    setInterval(()=>{
      console.log("DATOS ACTUALIZADOS");
      getData();
    }, 2000);

  }, []);

  const onClickGet = async () => {
    const res = await api.get("/config/");
    setConfigData(res.data);
    return res.data;
  };

  const postToApi = async (formData) => {
    const res = await api.post("/config/", formData);
    setConfigData(res.data);
    // ESTO ES UN EJEMPLO DE COMO HACER UN POST (no funciona por que los campos no son los correctos aqui)
  };

  const getData = async () => {
    const res = await api.get(`/data/`);
    const datos = parseResponse(res);
  }

  const toggleGraph = () => {
    const newESP = idDevice=== "oli" ? "ola" : "oli"
    setIdDevice(newESP);
    console.log("La nueva ESP es", newESP);
    console.log(data);
  }

  const clearTable = (t) => {
    for (const dataset of t){
      dataset.data = [];
    }
  }

  const fillDataSet = (id_device, setFunction, array, array2, element) => {
    if (id_device === ESP1){
      for (const dataset of array){
        dataset.data?.push(element[dataset.title])
      }
    } else {
      for (const dataset of array2){
        dataset.data?.push(element[dataset.title])
      }
    }
    //console.log("ARRAYS:", array, array2);
    const newDataSet = {[ESP1]: array, [ESP2]: array2}
    setFunction(newDataSet);
  }

  function parseResponse(res) {
    clearTable(datos);
    clearTable(p3_frec_data);
    clearTable(p3_amp_data);
    clearTable(datos2);
    clearTable(p3_frec_data2);
    clearTable(p3_amp_data2);
    for (let i = 0; i < res.data.length; i++) {
      const element = res.data[i].__data__;
      const id_device = element.id_device;
      
      fillDataSet(id_device, setData, datos, datos2, element);
      fillDataSet(id_device, setP3FrecData, p3_frec_data, p3_frec_data2, element);
      fillDataSet(id_device, setP3AmpData, p3_amp_data, p3_amp_data2, element);
    }
    return datos;
  }

  const createData = async () => {
    for (let i = 0; i < 10; i++) {
      const res = await api.post("/data/", configData);
      console.log(res);
    }
  }

  const purgeData = async () => {
    await api.delete("/data/");
    setData({[ESP1]: [], [ESP2]: []});
    setP3AmpData({[ESP1]: [], [ESP2]: []});
    setP3FrecData({[ESP1]: [], [ESP2]: []});
  }

  return (
    <>
      <h1 className="text-4xl m-4">Plantilla T3</h1>
          <button
            onClick={toggleGraph}
            className="px-4 py-2 rounded hover:bg-blue-500 bg-blue-300 m-4 "
          >
            Cambiar IdDevice
          </button>

      <div className="flex w-full h-full p-5">
        <div className="w-1/3 border rounded-md ">
          <h3 className="text-2xl p-2">Settings</h3>
          <SettingsForm postToApi={postToApi} getFromApi={onClickGet}></SettingsForm>

          <Comment
            comment={`Aqui deben de poner todos los settings para interactuar con la base de datos deben de ser todos`}
          ></Comment>
        </div>

        <div className="w-2/3 border rounded-md ">
          <h3 className="text-2xl p-2">Datos</h3>

          {(idDevice === ESP1) ?
          (<>
          <BaseGraph datasets={data[ESP1]} title={`Grafico ${ESP1}`}></BaseGraph>
          <BaseGraph datasets={p3_amp[ESP1]} title={`Grafico protocolo 3 ${ESP1}`}></BaseGraph>
          <BaseGraph datasets={p3_frec[ESP1]} title={`Grafico protocolo 3 ${ESP1}`}></BaseGraph>
          </>
          ) : (
          <>
          <BaseGraph datasets={data[ESP2]} title={`Grafico ${ESP2}`}></BaseGraph>
          <BaseGraph datasets={p3_amp[ESP2]} title={`Grafico protocolo 3 ${ESP2}`}></BaseGraph>
          <BaseGraph datasets={p3_frec[ESP2]} title={`Grafico protocolo 3 ${ESP2}`}></BaseGraph>
          </>
          )}
          

          <Comment
            comment={`Aquí se espera que puedan seleccionar qué datos se quieren graficar
              , y de qué dispositivo (Cuál de las dos ESP)`}
          ></Comment>

          <h3 className="text-2xl p-2">API</h3>
          <Comment comment={`Les puede ser util ir a localhost:8000/docs!`} />

          <button
            onClick={onClickGet}
            className="px-4 py-2 rounded hover:bg-blue-500 bg-blue-300 m-4 "
          >
            GET
          </button>

          <button
            onClick={() => {setConfigData()}}
            className="px-4 py-2 rounded hover:bg-red-500 bg-red-300 m-4 "
          >
            CLEAR
          </button>
          <button
            onClick={() => {createData()}}
            className="px-4 py-2 rounded hover:bg-green-500 bg-blue-300 m-4 "
          >
            CREATE DATA
          </button>
          <button
            onClick={() => {purgeData()}}  
            className="px-4 py-2 rounded hover:bg-red-700 bg-red-500 m-4 "
          >
            CLEAR DATABASE DATA
          </button>
          <p>Resultados del GET:</p>
          <br />
          <p>{JSON.stringify(configData)}</p>
          <br />
          <Comment
            comment={`Aqui jueguen modificando el enpoint en backend/src/main.py`}
          />
        </div>
      </div>
    </>
  );
};

export default MainView;
