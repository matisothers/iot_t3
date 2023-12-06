from peewee import PostgresqlDatabase, DoesNotExist
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from modelos import create_tables, Configuration, Datos
import random
from math import sqrt
# -------------------------
# Conexion a la base de datos
# -------------------------

ESP1 = "oli"
ESP2 = "ola"

db = PostgresqlDatabase(
    'iot_db',
    user='postgres',
    password='postgres',
    host='db',  # Si usan docker compose, el host es el nombre del servicio, si no, es localhost
    port='5432'
)


def get_database():
    db.connect()
    try:
        yield db
    finally:
        if not db.is_closed():
            db.close()

# -------------------------
# Creacion de la app
# -------------------------


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Aqui pueden colocar sus endpoints
# -------------------------


class SetSetting(BaseModel):
    # Esto de ocupa para definir que recive un endpoint
    transport_layer: int
    id_protocol: int


@app.get("/ejemplo/")
async def get_items(database: PostgresqlDatabase = Depends(get_database)):
    # Aqui pueden acceder a la base de datos ,hacer las consultas que necesiten
    create_tables()
    tables = database.get_tables()  # esto es solo un ejemplo
    print(tables)
    return {"message": "Hello World in get"}


@app.post("/ejemplo/")
async def create_item(setting: SetSetting, database: PostgresqlDatabase = Depends(get_database)):
    # aqui reciben un objeto de tipo Setting
    setting_dict = setting.dict()
    print(setting_dict)
    # Luego pueden usar la base de datos
    tables = database.get_tables()  # esto es solo un ejemplo
    print(tables)
    return {"message": "Hello World"}



@app.get("/create-tables/")
async def create_tables_in_db():
    create_tables()
    return {"message": "Tablas Creadas!", "code": 200}

@app.get("/config/")
async def get_config(database: PostgresqlDatabase = Depends(get_database)):
    config_table = Configuration()
    
    config = config_table.get_by_id(1)
    
    return {"transport_layer": config.transport_layer, "id_protocol": config.id_protocol}


@app.post("/config/")
async def set_config(setting: SetSetting, database: PostgresqlDatabase = Depends(get_database)):
    setting_dict = setting.dict()
    print(setting_dict)
    config_table = Configuration()
    newconfig = {"transport_layer": setting_dict["transport_layer"], "id_protocol": setting_dict["id_protocol"]}
    try:
        config = config_table.get_by_id(1)
        config.transport_layer = setting_dict["transport_layer"]
        config.id_protocol = setting_dict["id_protocol"]
        config.save()

    except DoesNotExist:
        config_table.create(**newconfig)
    
    return newconfig


@app.get("/data/")
async def get_data():
    datos = Datos()
    response_data_esp1 = list(datos.select().where(Datos.id_device == ESP1).order_by(Datos.id.desc()).limit(50))
    response_data_esp2 = list(datos.select().where(Datos.id_device == ESP2).order_by(Datos.id.desc()).limit(50))
    return response_data_esp1 + response_data_esp2

# funcion para testear noma
@app.post("/data/")
async def create_random_data(setting: SetSetting, database: PostgresqlDatabase = Depends(get_database)):
    data = setting.dict()
    protocol = data["id_protocol"]
    row = {"batt_level": random.randint(0, 100)}
    row["header_id"]  = random.randint(0, 10000)
    row["id_device"]  = "oli" if random.randint(0,1) == 0 else "ola"
    row["id_protocol"]  = protocol
    row["transport_layer"]  = data["transport_layer"]
    row["length"]  = 1
    row["header_mac"] = "aa:bb:cc:dd"
    if (protocol > 1):
        row["length"]  += 12
        row["temp"] = random.randint(5, 30)
        row["hum"] = random.randint(30, 80)
        row["pres"] = random.randint(1000, 1200)
        row["co"] = random.uniform(30, 200)
    if (protocol > 2):
        """
        Ampx: Valores aleatorios entre  0.0059 ,0.12
        Freqx: Valores aleatorios entre 29.0 ,31.0
        Ampy: Valores aleatorios entre  0.0041 ,0.11
        Freqy: Valores aleatorios entre 59.0 ,61.0
        Ampz: Valores aleatorios entre  0.008 ,0.15
        Freqz: Valores aleatorios entre 89.0 ,91.0
        RMS: sqrt{(Ampx^2 + Ampy^2 + Ampz^2)}"""
        row["amp_x"] = random.uniform (0.0059 ,0.12)
        row["frec_x"] = random.uniform(29.0 ,31.0)
        row["amp_y"] = random.uniform (0.0041 ,0.11)
        row["frec_y"] = random.uniform(59.0 ,61.0)
        row["amp_z"] = random.uniform (0.008 ,0.15)
        row["frec_z"] = random.uniform(89.0 ,91.0)
        row["rms"] = sqrt(row["amp_x"]**2 + row["amp_y"]**2 + row["amp_z"]**2)

    Datos().create(**row)

    return row

@app.delete("/data/")
async def purge(database: PostgresqlDatabase = Depends(get_database)):
    Datos.delete().where(Datos.batt_level >= 0).execute()
    return list(Datos.select())