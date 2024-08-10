import { NextResponse } from "next/server";
import connect from "../../../../lib/db";
import User from "../../../../lib/models/user";

const ObjectId = require("mongodb").ObjectId;

const checkUserId = (userId: any) => {
	if (!userId) {
		return new NextResponse("User ID is required", { status: 400 });
	}

	if (!ObjectId.isValid(userId)) {
		return new NextResponse("Invalid User ID", { status: 400 });
	}
}

export const GET = async () => {
  try {
    await connect();
    const users = await User.find();
    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (error: any) {
    console.error("Error: ", error);
    return new NextResponse(`Error connecting to database: ${error.message}`, { status: 500 });
  }
};


export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    await connect();
    const user = new User(body);
    await user.save();

    return new NextResponse("Created Successfully", { status: 201 });
  } catch (error: any) {
    console.error("Error: ", error);
    return new NextResponse(`Error connecting to database: ${error.message}`, { status: 500 });
  }
};


export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { userId, newUsername, newPassword, newEmail } = body;
    await connect();

		checkUserId(userId);

    const updateField: any = {};

    if (newUsername) {
      updateField.username = newUsername;
    }

    if (newPassword) {
      updateField.password = newPassword;
    }

    if (newEmail) {
      updateField.email = newEmail;
    }

    if (Object.keys(updateField).length === 0) {
      return new NextResponse("No fields to update", { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateField, { new: true });

    if (!updatedUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    return new NextResponse("Updated Successfully", { status: 200 });
  } catch (error: any) {
    console.error("Error: ", error);
    return new NextResponse(`Error connecting to database: ${error.message}`, { status: 500 });
  }
};

export const DELETE = async (request: Request) => {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		checkUserId(userId);

		await connect();

		const deletedUser = await User.findByIdAndDelete(userId);

		if (!deletedUser) {
			return new NextResponse("User not found", { status: 404 });
		}


		return new NextResponse("Deleted Successfully", { status: 200 });
	} catch (error: any) {
		console.error("Error: ", error);
		return new NextResponse(`Error connecting to database: ${error.message}`, { status: 500 });
	}
};
