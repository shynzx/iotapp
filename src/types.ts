// types.ts
export interface Sensor {
  humedad: number;
  temperatura: number;
  lluvia: number;
  sol: number;
}

export interface Parcela {
  id: number;
  nombre: string;
  ubicacion: string;
  responsable: string;
  cultivo: string; // Usado en MapComponent
  tipo_cultivo: string; // Usado en Humedad
  ultimo_riego: string; // Usado en Humedad
  estado: boolean; // Usado en MapComponent
  lat: number; // Usado en MapComponent
  long: number; // Usado en MapComponent
  latitud: number; // Usado en Humedad
  longitud: number; // Usado en Humedad
  sensor: Sensor; // Usado en ambos
}