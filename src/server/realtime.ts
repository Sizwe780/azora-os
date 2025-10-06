// src/server/realtime.ts
import { Server } from 'socket.io';
import { prisma } from './prisma';

export function attachRealtime(server: any) {
  const io = new Server(server, { cors: { origin: '*' } });
  const app = (server as any).app || (server as any); // ensure you can set 'io' on your app
  app.set('io', io);

  io.on('connection', (socket) => {
    socket.on('trip:join', (tripId: string) => socket.join(`trip:${tripId}`));

    socket.on('driver:location', async (payload: { driverId: string; lat: number; lon: number }) => {
      await prisma.driver.update({ where: { id: payload.driverId }, data: { lastLat: payload.lat, lastLon: payload.lon, lastUpdated: new Date() } });
      io.emit('dispatch:update', { driverId: payload.driverId, lat: payload.lat, lon: payload.lon, updatedAt: Date.now() });
    });
  });

  return io;
}
