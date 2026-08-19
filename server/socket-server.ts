import { createServer } from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import { prisma } from "./prisma";
import { CANAUX_REDIS } from "../src/lib/redis/canaux";
import { EVENEMENTS_SOCKET } from "../src/lib/realtime/evenements";
import { NOM_COOKIE_SESSION } from "../src/lib/auth/constants";
import { hasherToken } from "../src/lib/auth/hash-token";

const PORT = parseInt(process.env.SOCKET_PORT ?? "3001", 10);

async function main() {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      credentials: true,
    },
    path: "/socket.io",
  });

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error(
      "[sigh-socket] REDIS_URL manquant : le temps réel (notifications, sons, alertes) ne fonctionnera pas."
    );
  }
  if (redisUrl) {
    const pub = new Redis(redisUrl);
    const sub = pub.duplicate();
    io.adapter(createAdapter(pub, sub));

    sub.subscribe(CANAUX_REDIS.messagerie, CANAUX_REDIS.notifications, CANAUX_REDIS.presence);
    sub.on("message", (channel, message) => {
      try {
        const payload = JSON.parse(message);
        if (channel === CANAUX_REDIS.notifications && payload.utilisateurId) {
          io.to(`user:${payload.utilisateurId}`).emit(
            EVENEMENTS_SOCKET.NOUVELLE_NOTIFICATION,
            payload
          );
        } else if (channel === CANAUX_REDIS.messagerie && payload.conversationId) {
          const event = payload.event ?? EVENEMENTS_SOCKET.NOUVEAU_MESSAGE;
          io.to(`conv:${payload.conversationId}`).emit(event, payload);
        } else if (channel === CANAUX_REDIS.presence) {
          io.emit(EVENEMENTS_SOCKET.PRESENCE, payload);
        }
      } catch {
        /* ignore */
      }
    });
  }

  io.use(async (socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie ?? "";
      const match = cookie.match(new RegExp(`${NOM_COOKIE_SESSION}=([^;]+)`));
      const token = match?.[1];
      if (!token) return next(new Error("Non authentifié"));

      const session = await prisma.session.findUnique({
        where: { tokenHash: hasherToken(token) },
        include: { utilisateur: true },
      });

      if (!session || session.expireLe < new Date()) {
        return next(new Error("Session expirée"));
      }

      socket.data.utilisateurId = session.utilisateurId;
      next();
    } catch {
      next(new Error("Auth échouée"));
    }
  });

  io.on("connection", (socket) => {
    const utilisateurId = socket.data.utilisateurId as string;
    socket.join(`user:${utilisateurId}`);

    socket.on("rejoindre_conversation", (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("quitter_conversation", (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on(EVENEMENTS_SOCKET.TYPING, (data: { conversationId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit(EVENEMENTS_SOCKET.TYPING, {
        conversationId: data.conversationId,
        utilisateurId,
      });
    });

    socket.on("disconnect", () => {
      io.emit(EVENEMENTS_SOCKET.PRESENCE, {
        utilisateurId,
        statut: "HORS_LIGNE",
      });
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`🔌 Socket.IO SIGH — port ${PORT} (temps réel notifications)`);
  });
}

main().catch(console.error);
