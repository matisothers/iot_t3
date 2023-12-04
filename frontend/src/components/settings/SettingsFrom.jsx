import { useForm } from "react-hook-form";

export default function App({postToApi, getFromApi}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: async () => {
      // aqui pueden hacer un api.get para obtener la configuracion actual
      let initialData = await getFromApi();
      console.log(initialData);
      return {
        transport_layer: initialData["transport_layer"],
        id_protocol: initialData["id_protocol"],
      };
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    // Aqui deben de enviar a la api un cambio en la configuracion
    postToApi(data);
  };

  console.log(watch("nombreDelCampo")); // watch input value by passing the name of it

  return (
    <form className="flex flex-col gap-2 p-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-center items-center p-4  bg-slate-100 rounded-md shadow-black">
        <label className="whitespace-nowrap mr-5">Transport Layer:</label>
        <input
          className="w-full h-10 rounded"
          {...register("transport_layer")}
        />
      </div>

      <div className="flex justify-center items-center p-4  bg-slate-100 rounded-md shadow-black">
        <label className="whitespace-nowrap mr-5">Id Protocol:</label>
        <input
          className="w-full h-10 rounded"
          {...register("id_protocol")}
        />
      </div>

      <input
        className="w-fit h-10 px-4 bg-green-300 rounded text-slate-800 py-2 cursor-pointer hover:bg-green-400"
        type="submit"
      />
    </form>
  );
}
