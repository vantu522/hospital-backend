import { Router } from "express";
import serviceController from "../app/controllers/service.controller.js";
import upload from "../app/middlewares/upload.js";
import { authenticateToken, requireAdmin } from '../app/middlewares/auth.js';


const serviceRouter = Router();

serviceRouter.post(
  "/",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  serviceController.createService
);
serviceRouter.get("/",serviceController.getAllServices);
serviceRouter.get("/specialty/:specialtyId", serviceController.getServicesBySpecialty);
serviceRouter.get("/slug/:slug", serviceController.getServiceBySlug);
serviceRouter.put(
  "/:id",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  serviceController.updateService
);
serviceRouter.delete("/:id", serviceController.deleteService);

export default serviceRouter;
