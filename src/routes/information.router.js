import { Router } from "express";
import * as informationController from "../app/controllers/information.controller.js";
import upload from "../app/middlewares/upload.js";

const informationRouter = Router();

informationRouter.get('/main',informationController.getMainInformation);
informationRouter.get('/',informationController.getAllInformation);

informationRouter.put('/:id',informationController.updateInformation); 
informationRouter.post('/',informationController.createInformation);    
informationRouter.delete('/:id',informationController.deleteInformation);

export default informationRouter;