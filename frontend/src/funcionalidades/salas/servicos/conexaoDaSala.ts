import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export function criarConexaoDaSala(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl("/hubs/sala")
    .withAutomaticReconnect()
    .configureLogging(LogLevel.None)
    .build();
}
