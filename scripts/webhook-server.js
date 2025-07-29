#!/usr/bin/env node

const http = require("http")
const crypto = require("crypto")
const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

// Configuration
const PORT = process.env.WEBHOOK_PORT || 9000
const SECRET = process.env.WEBHOOK_SECRET
const APP_DIR = "/var/www/gotta-listen"
const LOG_FILE = "/var/log/gotta-listen-webhook.log"

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, "")
}

// Logging function
function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  console.log(logMessage.trim())
  fs.appendFileSync(LOG_FILE, logMessage)
}

// Verify GitHub webhook signature
function verifySignature(payload, signature) {
  if (!SECRET) {
    log("WARNING: No webhook secret configured")
    return true // Allow if no secret is set (not recommended for production)
  }

  const expectedSignature = "sha256=" + crypto.createHmac("sha256", SECRET).update(payload).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

// Execute deployment script
function executeDeploy() {
  return new Promise((resolve, reject) => {
    log("Starting deployment process...")

    const deployScript = path.join(APP_DIR, "scripts", "auto-deploy.sh")
    const deploy = spawn("bash", [deployScript], {
      cwd: APP_DIR,
      stdio: "pipe",
    })

    let output = ""
    let errorOutput = ""

    deploy.stdout.on("data", (data) => {
      const message = data.toString()
      output += message
      log(`DEPLOY STDOUT: ${message.trim()}`)
    })

    deploy.stderr.on("data", (data) => {
      const message = data.toString()
      errorOutput += message
      log(`DEPLOY STDERR: ${message.trim()}`)
    })

    deploy.on("close", (code) => {
      if (code === 0) {
        log("Deployment completed successfully")
        resolve({ success: true, output })
      } else {
        log(`Deployment failed with exit code ${code}`)
        reject({ success: false, error: errorOutput, code })
      }
    })

    deploy.on("error", (error) => {
      log(`Deployment process error: ${error.message}`)
      reject({ success: false, error: error.message })
    })
  })
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Hub-Signature-256")

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  // Health check endpoint
  if (req.url === "/health" && req.method === "GET") {
    log("Health check requested")
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(
      JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      }),
    )
    return
  }

  // Webhook endpoint
  if (req.url === "/webhook" && req.method === "POST") {
    let body = ""

    req.on("data", (chunk) => {
      body += chunk.toString()
    })

    req.on("end", async () => {
      try {
        log(`Webhook received from ${req.headers["x-forwarded-for"] || req.connection.remoteAddress}`)

        // Verify signature
        const signature = req.headers["x-hub-signature-256"]
        if (!verifySignature(body, signature)) {
          log("Invalid webhook signature")
          res.writeHead(401, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "Invalid signature" }))
          return
        }

        // Parse payload
        const payload = JSON.parse(body)

        // Check if it's a push event to the main branch
        if (payload.ref !== "refs/heads/main") {
          log(`Ignoring push to branch: ${payload.ref}`)
          res.writeHead(200, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Ignored - not main branch" }))
          return
        }

        log(`Push event received for ${payload.repository.full_name}`)
        log(`Commits: ${payload.commits.length}`)

        // Execute deployment
        try {
          const result = await executeDeploy()

          res.writeHead(200, { "Content-Type": "application/json" })
          res.end(
            JSON.stringify({
              success: true,
              message: "Deployment completed successfully",
              timestamp: new Date().toISOString(),
            }),
          )
        } catch (deployError) {
          log(`Deployment failed: ${deployError.error}`)

          res.writeHead(500, { "Content-Type": "application/json" })
          res.end(
            JSON.stringify({
              success: false,
              error: "Deployment failed",
              details: deployError.error,
              timestamp: new Date().toISOString(),
            }),
          )
        }
      } catch (error) {
        log(`Webhook processing error: ${error.message}`)

        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify({
            error: "Invalid payload",
            message: error.message,
          }),
        )
      }
    })

    return
  }

  // 404 for other routes
  res.writeHead(404, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "Not found" }))
})

// Error handling
server.on("error", (error) => {
  log(`Server error: ${error.message}`)
})

// Start server
server.listen(PORT, () => {
  log(`Webhook server started on port ${PORT}`)
  log(`Health check: http://localhost:${PORT}/health`)
  log(`Webhook endpoint: http://localhost:${PORT}/webhook`)

  if (!SECRET) {
    log("WARNING: No webhook secret configured. Set WEBHOOK_SECRET environment variable.")
  }
})

// Graceful shutdown
process.on("SIGTERM", () => {
  log("Received SIGTERM, shutting down gracefully")
  server.close(() => {
    log("Webhook server stopped")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  log("Received SIGINT, shutting down gracefully")
  server.close(() => {
    log("Webhook server stopped")
    process.exit(0)
  })
})
