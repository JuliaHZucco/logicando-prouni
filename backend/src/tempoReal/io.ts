import { Server } from "socket.io";

export const io = new Server();

export const canalSala = (codigo: string) => `sala:${codigo}`;
export const canalModerador = (codigo: string) => `moderador:${codigo}`;
