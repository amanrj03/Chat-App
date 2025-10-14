// Run in your environment to broadcast new-message events (not used in v0 preview runtime)
import express from "express"
import { WebSocketServer } from "ws"
import http from "http"

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

type Client = {
  ws: import("ws")
}
const clients = new Set<Client>()

wss.on("connection", (ws) => {
  const client = { ws }
  clients.add(client)
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString())
      if (data.type === "new-message" && data.conversationId) {
        // Fan-out to all for demo; in prod, route by recipient
        for (const c of clients) {
          if (c.ws !== ws) c.ws.send(JSON.stringify({ type: "new-message", conversationId: data.conversationId }))
        }
      }
    } catch {}
  })
  ws.on("close", () => clients.delete(client))
})

app.get("/", (_req, res) => res.send("WS server running"))
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`[v0] WS listening on :${PORT}`)
})
