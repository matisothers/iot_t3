import BaseGraph from "../components/graficos/BaseGraph";
import SettingsForm from "../components/settings/SettingsFrom";
import Comment from "../components/utiles/Comment";
import api from "../utils/api";

import { useState, useEffect } from "react";

const MainView = () => {
  const datos = [
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
  const [apiData, setApiData] = useState();
  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  const onClickGet = async () => {
    const res = await api.get("/config/");
    setApiData(res.data);
    return res.data;
  };

  const postToApi = async (formData) => {
    console.log(formData);
    const res = await api.post("/config/", formData);
    setApiData(res.data);
    // ESTO ES UN EJEMPLO DE COMO HACER UN POST (no funciona por que los campos no son los correctos aqui)
  };

  const getData = async () => {
    const res = await api.get("/data/");
    const datos = parseResponse(res);
    setData(datos);
  }

  function parseResponse(res) {
    for (let i = 0; i < res.data.length; i++) {
      const element = res.data[i].__data__;
      for (const [key, value] of Object.entries(element)) {
        
        let res = datos.filter((v) => v["title"] === key)
        if (!res.length) continue;
        res[0]["data"].push(value);
      }
      
    }
    console.log(datos);
    return datos;
  }

  const createData = async () => {
    for (let i = 0; i < 10; i++) {
      const res = await api.post("/data/", apiData);
      console.log(res);
    }
    getData();
  }

  const purgeData = async () => {
    await api.delete("/data/");
    setData();
  }

  return (
    <>
      <h1 className="text-4xl m-4">Plantilla T3</h1>

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

          <BaseGraph datasets={data} title="Grafico"></BaseGraph>

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
            onClick={() => {setApiData()}}
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
          <p>{JSON.stringify(apiData)}</p>
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
