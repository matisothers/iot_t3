from peewee import *

# Configuración de la base de datos
db_config = {
    'host': 'db', 
    'port': 5432, 
    'user': 'postgres', 
    'password': 'postgres', 
    'database': 'iot_db'
}
db = PostgresqlDatabase(**db_config)

# Definición de un modelo
class BaseModel(Model):
    class Meta:
        database = db

class Datos(BaseModel):
    # HEADER
    header_id = IntegerField()
    header_mac = CharField(max_length=30)
    transport_layer = CharField(max_length=3)
    id_protocol = IntegerField()
    length = IntegerField()

    # BODY
    batt_level = IntegerField(null=True)
    temp = IntegerField(null=True)
    press = IntegerField(null=True)
    hum = IntegerField(null=True)
    co = FloatField(null=True)
    rms = FloatField(null=True)
    amp_x = FloatField(null=True)
    frec_x = FloatField(null=True)
    amp_y = FloatField(null=True)
    frec_y = FloatField(null=True)
    amp_z = FloatField(null=True)
    frec_z = FloatField(null=True)
    
    timestamp = IntegerField(null=True)
    id_device = CharField()

class Logs(BaseModel):
    id_device = CharField()
    transport_layer = IntegerField(null=True)
    id_protocol = IntegerField(null=True)
    timestamp = DateTimeField()

class Configuration(BaseModel):
    id_protocol = IntegerField()
    transport_layer = IntegerField()
    tcp_port = IntegerField()
    udp_port = IntegerField()
    gyro_sensibility = FloatField(null=True)
    acc_sensibility = FloatField(null=True)
    acc_sampling_rate = FloatField(null=True)
    gyro_sampling_rate = FloatField(null=True)
    discontinous_time = IntegerField()  # este importa -> tiempo en deep sleep
    host_ip_address = CharField(max_length=20)
    wifi_ssid = CharField()
    wifi_password = CharField()



class Loss(BaseModel):
    delay = FloatField() # ms
    packet_loss = IntegerField()


def create_tables():
    with db:
        db.create_tables([Datos, Logs, Configuration, Loss])
        print("tablas creadas")
    
    config = Configuration()
    info = {"transport_layer": 0, "id_protocol": 0, 
            "tcp_port": 1234, "udp_port": 1235, # PUERTOS WIFI
            "gyro_sensibility": 1.1, "acc_sensibility": 5.2,
            "acc_sampling_rate": 3.0, "gyro_sampling_rate": 2.0,
            "discontinous_time": 60, # tiempo en segundos en deep sleep
            "host_ip_address" : "192.168.4.1",  # IP ADDRESS ! ! ! !
            "wifi_ssid" : "testIot",
            "wifi_password" : "IotTeam2023"
            }
    
    try:
        row = config.get_by_id(1)
        for key, value in info.items():
            setattr(row,key,value)
        row.save()
        

    except DoesNotExist:
        config.create(**info)

    except Exception as e:
        print(e)