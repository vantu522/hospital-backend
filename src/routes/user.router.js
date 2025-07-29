import { Router } from 'express';
import * as userController from '../app/controllers/user.controller.js'
import * as contactController from '../app/controllers/contact.controller.js';
import { validate } from '../app/middlewares/validate.js';
import { createContact } from '../app/request/contact.request.js';

const userRouter = Router();

userRouter.get('/', userController.getUsers);
userRouter.post('/', userController.createUser);

userRouter.post('/contact', validate(createContact) ,contactController.createContact);
userRouter.get('/contact', contactController.getAllContacts);
userRouter.delete('/contact/:id', contactController.deleteContact);
userRouter.delete('/contact', contactController.deleteAllContacts);

export default userRouter;
