import { NextResponse } from "next/server";
import connect from "../../../../lib/db";
import User from "../../../../lib/models/user";
import Category from "../../../../lib/models/category";
import { Types } from "mongoose";

const ObjectId = require("mongodb").ObjectId;

const checkUserId = async (userId: any) => {
	if (!userId) {
		return new NextResponse("User ID is required", { status: 400 });
	}

	if (!ObjectId.isValid(userId)) {
		return new NextResponse("Invalid User ID", { status: 400 });
	}

	const user = await User.findById(userId);

	if (!user) {
		return new NextResponse("User not found", { status: 404 });
	}

}

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    checkUserId(userId);

    await connect();

    const categories = await Category.find({ user: userId });

    const categoryTitles = categories.map(category => category.title);

    return new NextResponse(JSON.stringify(categoryTitles), { status: 200 });
  } catch (error: any) {
    console.error("Error: ", error);
    return new NextResponse(`Error connecting to database: ${error.message}`, { status: 500 });
  }
};



export const POST = async (request: Request) => {
	try	{
		const body = await request.json();
		const { userId, title } = body;

		await connect();

		const category = new Category({ user: userId, title: title });
		await category.save();

		return new NextResponse("Created Successfully", { status: 201 });
	} catch (error: any) {
		console.error("Error: ", error);
		return new NextResponse(`Error connecting to database: ${error.message}`, { status: 500 });
	}
}
