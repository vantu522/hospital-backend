import { Router } from "express";
import * as contactController from "../app/controllers/contact.controller.js";


const contactRouter = Router();

contactRouter.post('/', contactController.createContact);
contactRouter.get('/', contactController.getAllContacts);
contactRouter.get('/:id', contactController.getContactById);
contactRouter.put('/:id', contactController.updateContact);
contactRouter.delete('/:id', contactController.deleteContact);

export default contactRouter;