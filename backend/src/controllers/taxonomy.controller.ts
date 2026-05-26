import type { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const getCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });
  res.json({ success: true, data: categories });
};

export const getSubcategories = async (req: Request, res: Response) => {
  const subcategories = await prisma.subcategory.findMany({
    orderBy: { name: "asc" }
  });
  res.json({ success: true, data: subcategories });
};
