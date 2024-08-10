import { NextResponse } from "next/server";
import connect from "../../../../../lib/db";
import Blog from "../../../../../lib/models/blog";
import { Types } from "mongoose";
import User from "../../../../../lib/models/user";
import Category from "../../../../../lib/models/category";


const checkId = async (userId: any, categoryId: any, blogId: any) => {
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

  if (!blogId) {
    return new NextResponse("Blog ID is required", { status: 400 });
  }

  if (!Types.ObjectId.isValid(blogId)) {
    return new NextResponse("Invalid Blog ID", { status: 400 });
  }

  const blog = await Blog.findById(blogId);

  if (!blog) {
    return new NextResponse("Blog not found", { status: 404 });
  }
};


export const GET = async (request: Request, context: { params: any }) => {
  const blogId = context.params.blog;
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

    await connect();

    const errorResponse = await checkId(userId, categoryId, blogId);

    if (errorResponse) {
      return errorResponse;
    }

    const blog = await Blog.findOne({ _id: blogId, user: userId, category: categoryId }).populate("user category");

    if (!blog) {
      return new NextResponse("Blog not found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(blog), { status: 200 });
  } catch (error: any) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};


export const PATCH = async (request: Request, context: { params: any }) => {
  const blogId = context.params.blog;

	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");
		const categoryId = searchParams.get("categoryId");
		const body = await request.json();
		const { title, content } = body;

		await connect();

		const errorResponse = await checkId(userId, categoryId, blogId);

		if (errorResponse) {
			return errorResponse;
		}

		const blog = await Blog.findOne({ _id: blogId, user: userId });

		if (!blog) {
			return new NextResponse("Blog not found", { status: 404 });
		}

		const updatedBlog = await Blog.findByIdAndUpdate(
			blogId,
			{ title: title, content: content },
			{ new: true }
		);

		return new NextResponse(JSON.stringify(updatedBlog), { status: 200 });
	} catch (error: any) {
		return new NextResponse("Internal Server Error", { status: 500 });
	}
};


export const DELETE = async (request: Request, context: { params: any }) => {
	const blogId = context.params.blog;

	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");
		const categoryId = searchParams.get("categoryId");

		await connect();
		checkId(userId, categoryId, blogId);

		const blog = await Blog.findOneAndDelete({ _id: blogId, user: userId });

		if (!blog) {
			return new NextResponse("Blog not found", { status: 404 });
		}

		return new NextResponse("Blog deleted successfully", { status: 200 });
	} catch (error: any) {
		return new NextResponse("Internal Server Error", { status: 500 });
	}
};
