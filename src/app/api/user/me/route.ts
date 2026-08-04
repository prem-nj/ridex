import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        {
          success: false,
          message: "User is not authenticated",
        },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

return Response.json(user, { status: 200 });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}