import { NextResponse } from "next/server";
import connect from "../../../../lib/db";
import Blog from "../../../../lib/models/blog";
import { Types } from "mongoose";
import User from "../../../../lib/models/user";
import Category from "../../../../lib/models/category";

const checkId = async (userId: any, categoryId: any) => {
  if (!userId) {
    return new NextResponse("User ID is required", { status: 400 });
  }

  if (!Types.ObjectId.isValid(userId)) {
    return new NextResponse("Invalid User ID", { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  if (!categoryId) {
    return new NextResponse("Category ID is required", { status: 400 });
  }

  if (!Types.ObjectId.isValid(categoryId)) {
    return new NextResponse("Invalid Category ID", { status: 400 });
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return new NextResponse("Category not found", { status: 404 });
  }
};

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");
		const searchKeywords = searchParams.get("keywords") as string;
		const startDate = searchParams.get("startDate") as string;
		const endDate = searchParams.get("endDate") as string;
		const page = parseInt(searchParams.get("page") as string) || 1;
		const limit = parseInt(searchParams.get("limit") as string) || 10;

    await connect();

    const errorResponse = await checkId(userId, categoryId);

		if (errorResponse) {
      return errorResponse;
    }

		const filter: any = {
			user: userId,
			category: categoryId
		}

		if (searchKeywords) {
			filter.$or = [
				{
					title: { $regex: searchKeywords, $options: "i" },
				},
				{
					description: { $regex: searchKeywords, $options: "i" }
				}
			]
		}

		if (startDate && endDate) {
			filter.createdAt = {
				$gte: new Date(startDate),
				$lte: new Date(endDate)
			}
		} else if (startDate) {
			filter.createdAt = {
				$gte: new Date(startDate)
			}
		} else {
			filter.createdAt = {
				$lte: new Date(endDate)
			}
		}

		const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter).populate("user category").sort({ createdAt: 1 }).limit(limit).skip(skip);

    return new NextResponse(JSON.stringify(blogs), { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    await connect();

    const body = await request.json();
    const { userId, categoryId, title, content } = body;

    const errorResponse = await checkId(userId, categoryId);
    if (errorResponse) {
      return errorResponse;
    }

    const blog = new Blog({ user: userId, category: categoryId, title, content });
    await blog.save();

    return new NextResponse("Created Successfully", { status: 201 });
  } catch (error: any) {
    console.error("Error: ", error);
    return new NextResponse(`Error connecting to database: ${error.message}`, { status: 500 });
  }
};
