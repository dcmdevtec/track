
import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Duplex } from 'stream';
import { WebSocketServer, WebSocket } from 'ws'; // Importa WebSocketServer y WebSocket
import { Socket } from 'net';

// Interfaz personalizada para extender Socket con la propiedad server
interface CustomSocket extends Socket {
  server: any;
}

// Interfaz personalizada para extender NextApiResponse
interface CustomNextApiResponse extends NextApiResponse {
  socket: CustomSocket;
}

// Una variable global para mantener la instancia del WebSocketServer.
// Esto es CRUCIAL en Next.js para evitar múltiples inicializaciones del servidor
// WebSocket durante el hot-reloading en desarrollo o en entornos serverless.
let wss: WebSocketServer | undefined;

export default function handler(req: NextApiRequest, res: CustomNextApiResponse) {
  // Asegurarse de que estamos en un entorno de servidor y que el socket está disponible.
  if (!res.socket || !res.socket.server) {
    res.status(500).json({ error: 'Server socket not available.' });
    return;
  }

  // Si el WebSocketServer aún no ha sido adjunto al servidor HTTP de Next.js
  if (!res.socket.server.wss) {
    console.log('✨ Inicializando WebSocket Server para AIS Stream Proxy...');
    const server = res.socket.server;
    wss = new WebSocketServer({ noServer: true }); // noServer: true permite un manejo manual del upgrade
    server.wss = wss; // Adjunta la instancia al servidor HTTP para que persista

    // Manejar la conexión WebSocket entrante desde el cliente (navegador)
    server.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer<ArrayBufferLike>) => {
        // Asegurarse de que la ruta de la solicitud coincida con la que esperamos para nuestro proxy
        if (request.url === '/api/websocket/ais-stream') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        } else {
            socket.destroy(); // Si no es la ruta correcta, destruir la conexión
        }
    });

    wss.on('connection', (ws: WebSocket, request: NextApiRequest) => {
      console.log('✅ Cliente del navegador conectado a nuestro proxy WebSocket.');

      // --- 1. Conectar desde TU SERVIDOR a AisStream.io ---
      const aisWs = new WebSocket("wss://stream.aisstream.io/v0/stream");

      aisWs.onopen = () => {
        console.log('📡 Proxy conectado a AisStream.io.');
        // Envía el mensaje de suscripción a AisStream.io DESDE EL SERVIDOR
        aisWs.send(
          JSON.stringify({
            Apikey: "c6c4f1897fe584d2ae5556af3c1365ec1d66d3f2", // <-- TU CLAVE API AQUÍ
            BoundingBoxes: [[[-90, -180], [90, 180]]], // Cubre todo el globo
            FilterMessageTypes: ["PositionReport"]
          })
        );
      };

      aisWs.onmessage = (messageEvent) => {
        // Cuando el servidor recibe datos de AisStream.io, los reenvía al cliente del navegador
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageEvent.data); // Reenvía los datos tal cual
        }
      };

      aisWs.onclose = (event) => {
        console.log(`🔌 Conexión con AisStream.io cerrada (Code: ${event.code}, Reason: ${event.reason || 'No Reason'}).`);
        // Si AisStream.io cierra la conexión, cierra también la conexión con el cliente del navegador
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(event.code, event.reason);
        }
      };

      aisWs.onerror = (error) => {
        console.error('❌ Error en la conexión del proxy a AisStream.io:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1011, 'Proxy error with AisStream.io'); // Código 1011 para error interno
        }
      };

      // --- 2. Manejo de mensajes del cliente del navegador ---
      // (En este caso, el cliente solo necesita recibir, pero esta es la plantilla si necesitaras que envíen datos al proxy)
      ws.onmessage = (message) => {
        console.log('Mensaje recibido del cliente del navegador (normalmente no esperado para AIS stream):', message.data);
        // Si el cliente necesitara enviar filtros, podrías procesarlos aquí y reenviarlos a aisWs.send()
      };

      ws.onclose = (event) => {
        console.log(` Cliente del navegador desconectado (Code: ${event.code}, Reason: ${event.reason || 'No Reason'}).`);
        // Cuando el cliente del navegador desconecta, cierra la conexión del servidor a AisStream.io
        if (aisWs.readyState === WebSocket.OPEN) {
          aisWs.close(event.code, event.reason);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error en la conexión del cliente del navegador al proxy:', error);
      };
    });
  }

  // Esto es crucial para que Next.js no intente manejar la solicitud HTTP,
  // ya que la ha "actualizado" a una conexión WebSocket.
  res.status(200).end();
}
  