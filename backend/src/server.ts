import http from "http";
import { env } from "./config/env";
import { createApp } from "./app";
import { prisma } from "./prisma/client";
import { initializeSocketServer } from "./realtime/socket.server";

const app = createApp();
const server = http.createServer(app);

initializeSocketServer(server);

server.listen(env.PORT, () => {
  console.log(`Juara WorkBridge backend listening on port ${env.PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
