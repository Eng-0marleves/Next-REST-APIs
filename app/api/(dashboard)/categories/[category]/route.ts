import { NextResponse } from "next/server";
import connect from "../../../../../lib/db";
import User from "../../../../../lib/models/user";
import { ObjectId } from "mongodb";

export const GET = async (request: Request, context: { params: { id: string } }) => {
	try {
		const { id } = context.params;

		if (!id || !ObjectId.isValid(id)) {
			return new NextResponse("Invalid or missing ID", { status: 400 });
		}

		await connect();

		const user = await User.findById(id);

		if (!user) {
			return new NextResponse("User not found", { status: 404 });
		}

		return new NextResponse(JSON.stringify(user), { status: 200 });

	} catch (error: any) {
		console.error("Error: ", error);
		return new NextResponse(`Error connecting to database: ${error.message}`, { status: 500 });
	}
};
