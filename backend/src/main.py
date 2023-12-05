from peewee import PostgresqlDatabase, DoesNotExist
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from modelos import create_tables, Configuration, Datos
import random
# -------------------------
# Conexion a la base de datos
# -------------------------

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
    # Aqui pueden acceder a la base de datos y hacer las consultas que necesiten
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
    try:
        config = config_table.get_by_id(1)
    except DoesNotExist:
        default_row = {"transport_layer": 0, "id_protocol": 0}
        config_table.create(**default_row)
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
    response_data = list(datos.select())
    return response_data

# funcion para testear noma
@app.post("/data/")
async def create_random_data(setting: SetSetting, database: PostgresqlDatabase = Depends(get_database)):
    data = setting.dict()
    print(data)
    protocol = data["id_protocol"]
    row = {"batt_level": random.randint(0, 100)}
    row["header_id"]  = random.randint(0, 10000)
    row["id_device"]  = "oli"
    row["id_protocol"]  = protocol
    row["transport_layer"]  = data["transport_layer"]
    row["length"]  = 1
    row["header_mac"] = "aa:bb:cc:dd"
    if (protocol > 0):
        row["length"]  += 12
        row["temp"] = random.randint(5, 30)
        row["hum"] = random.randint(30, 80)
        row["pres"] = random.randint(1000, 1200)
        row["co"] = random.randrange(30, 200)
    print(row)
    Datos().create(**row)

    return row

@app.delete("/data/")
async def purge(database: PostgresqlDatabase = Depends(get_database)):
    Datos.delete().where(Datos.batt_level >= 0).execute()
    return list(Datos.select())