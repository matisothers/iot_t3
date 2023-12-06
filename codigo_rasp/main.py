import asyncio
from modelos import Configuration, create_tables
from client import main
from server import Server




def my_main():
    # crea las tablas x si acaso
    create_tables()

    # loop
    while True: 
        config_table = Configuration()
        row = config_table.get_by_id(1)
       
        print(f"Configuracion: TL = {row.transport_layer}; Portocol = {row.protocol_id}")

        # Revisar config -> Wi Fi o BLE
        if row.transport_layer > 1: # 2 - 3: Wi Fi
            print("Iniciando servidor Wi Fi")
            # correr Wi Fi
            s = Server()
            s.run()



        else: # 0 - 1: BLE - client.py
            print("Iniciando cliente BLE")
            # correr BLE
            asyncio.run(main())
            



my_main()