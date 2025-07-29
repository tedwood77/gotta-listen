import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/database"

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth()

    const health = {
      status: dbHealth.healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: dbHealth,
      environment: process.env.NODE_ENV,
    }

    return NextResponse.json(health, {
      status: dbHealth.healthy ? 200 : 503,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
