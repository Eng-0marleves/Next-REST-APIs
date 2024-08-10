import { NextResponse, NextRequest } from "next/server";
import { authMiddleware } from "./middlewares/api/authMiddleware";
import { logMiddleware } from "./middlewares/api/logMiddleware";

export const config = {
  matcher: "/api/:path*"
};

export default function middleware(req: NextRequest) {
	if (req.url.includes("blogs")) {
		const logResult = logMiddleware(req);
		console.log(logResult.response);
	}

  const authResult = authMiddleware(req);

  if (!authResult?.isValid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.next();
}
