import { Router } from "express";
import * as doctorController from "../app/controllers/doctor.controller.js";
import upload from "../app/middlewares/upload.js";
import { requireAdminOrSuperadmin } from "../app/middlewares/auth.js";

const doctorRouter = Router();

doctorRouter.post(
  "/",
  requireAdminOrSuperadmin,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  doctorController.createDoctor
);
doctorRouter.get("/", doctorController.getAllDoctors);
doctorRouter.get("/five-doctors", doctorController.getFiveRandomDoctors);
doctorRouter.get(
  "/specialty/:specialtyId",
  doctorController.getDoctorsBySpecialty
);
doctorRouter.get("/slug/:slug", doctorController.getDoctorBySlug);
doctorRouter.put(
  "/:id",
  requireAdminOrSuperadmin,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  doctorController.updateDoctor
);
doctorRouter.delete(
  "/:id",
  requireAdminOrSuperadmin,
  doctorController.deleteDoctor
);
doctorRouter.get("/five-doctors", doctorController.getFiveRandomDoctors);

export default doctorRouter;
