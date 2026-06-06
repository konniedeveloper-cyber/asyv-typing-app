import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const { newUsername } = await request.json();

    // Validation
    if (!newUsername || typeof newUsername !== 'string') {
      return Response.json(
        { error: "Invalid username" },
        { status: 400 }
      );
    }

    const username = newUsername.trim();

    // Validate username length
    if (username.length < 3) {
      return Response.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (username.length > 20) {
      return Response.json(
        { error: "Username must not exceed 20 characters" },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric, underscore, hyphen only)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return Response.json(
        { error: "Username can only contain letters, numbers, underscores, and hyphens" },
        { status: 400 }
      );
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return Response.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Update username in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { username },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Username updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [UPDATE USERNAME] Error:", error);
    return Response.json(
      { error: "An error occurred while updating username" },
      { status: 500 }
    );
  }
}
