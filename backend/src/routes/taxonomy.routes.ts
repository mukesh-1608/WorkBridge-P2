import { Router } from "express";
import { getCategories, getSubcategories } from "../controllers/taxonomy.controller";

export const taxonomyRoutes = Router();

taxonomyRoutes.get("/categories", getCategories);
taxonomyRoutes.get("/subcategories", getSubcategories);
