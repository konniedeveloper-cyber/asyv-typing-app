import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * DELETE /api/admin/cleanup-activity
 * Deletes activity records older than specified days
 * Protected: Admin only
 * 
 * Query params:
 * - days: Number of days to retain (default: 7)
 * - dryRun: If true, only returns count without deleting (default: false)
 */
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 401 }
      );
    }

    // Get parameters from query string
    const { searchParams } = new URL(req.url);
    const retentionDays = parseInt(searchParams.get("days") || "7");
    const dryRun = searchParams.get("dryRun") === "true";

    if (retentionDays < 1) {
      return new Response(
        JSON.stringify({ error: "Retention days must be at least 1" }),
        { status: 400 }
      );
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`🧹 [CLEANUP] Starting activity cleanup...`);
    console.log(`📅 Cutoff date: ${cutoffDate.toISOString()}`);
    console.log(`🔍 Retention period: ${retentionDays} days`);
    console.log(`🧪 Dry run: ${dryRun}`);

    // Find records to delete
    const recordsToDelete = await prisma.activity.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    const deleteCount = recordsToDelete.length;

    console.log(`📊 Found ${deleteCount} records to delete`);

    // If not a dry run, actually delete
    if (!dryRun && deleteCount > 0) {
      const result = await prisma.activity.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      console.log(`✅ [CLEANUP] Successfully deleted ${result.count} activity records`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Deleted ${result.count} activity records older than ${retentionDays} days`,
          deletedCount: result.count,
          cutoffDate: cutoffDate.toISOString(),
        }),
        { status: 200 }
      );
    }

    // Dry run - just report
    return new Response(
      JSON.stringify({
        success: true,
        message: `Dry run: Would delete ${deleteCount} activity records older than ${retentionDays} days`,
        wouldDeleteCount: deleteCount,
        cutoffDate: cutoffDate.toISOString(),
        dryRun: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [CLEANUP] Activity cleanup error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to cleanup activity records",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
