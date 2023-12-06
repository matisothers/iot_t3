#include <stdio.h>
#include <inttypes.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "nvs_flash.h"
#include "nvs.h"
#include "server.h"
#include "main_client.h"



void app_main(void){
    //ver memoria no volatil
    // si no hay nada parte BLE continuo
    // si hayalgo hacer ese algo xd

    esp_err_t err = nvs_flash_init();
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        // NVS partition was truncated and needs to be erased
        // Retry nvs_flash_init
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }
    ESP_ERROR_CHECK( err );

    // Open
    printf("\n");
    printf("Opening Non-Volatile Storage (NVS) handle... ");
    nvs_handle_t my_handle;
    err = nvs_open("storage", NVS_READWRITE, &my_handle);
    if (err != ESP_OK) {
        printf("Error (%s) opening NVS handle!\n", esp_err_to_name(err));
    } else {
        printf("Done\n");

        // Read
        printf("Reading restart counter from NVS ... ");
        int32_t transport_layer = 0; // value will default to 0, if not set yet in NVS
        err = nvs_get_i32(my_handle, "transport_layer", &transport_layer);
        switch (err) {
            case ESP_OK:
                printf("Done\n");
                printf("transport_layer = %" PRIu32 "\n", transport_layer);
                break;
            case ESP_ERR_NVS_NOT_FOUND:
                printf("The value is not initialized yet!\n");
                break;
            default :
                printf("Error (%s) reading!\n", esp_err_to_name(err));
        } 



        // Corremos wifi o ble segun sea necesario

        if(transport_layer <= 1){ // 0 - 1 BLE
            transport_layer = run_server();
        }
        else{
            // aca deberia correr cliente wi fi
            transport_layer = run_client();
        }

        



        // cambiamos transport_layer




        // Write
        printf("Updating restart counter in NVS ... ");
        err = nvs_set_i32(my_handle, "transport_layer", transport_layer);
        printf((err != ESP_OK) ? "Failed!\n" : "Done\n");

        // Commit written value.
        // After setting any values, nvs_commit() must be called to ensure changes are written
        // to flash storage. Implementations may write to storage at other times,
        // but this is not guaranteed.
        printf("Committing updates in NVS ... ");
        err = nvs_commit(my_handle);
        printf((err != ESP_OK) ? "Failed!\n" : "Done\n");

        // Close
        nvs_close(my_handle);

        if(transport_layer == 1 || transport_layer == 2){
            esp_deep_sleep_start();
        }
    }

    printf("\n");

    // Restart module
   
    printf("Restarting now.\n");
    fflush(stdout);
    
}