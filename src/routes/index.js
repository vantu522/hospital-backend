import doctorRouter from "./doctor.router.js";
import newsRouter from "./news.router.js";
import recruitmentRouter from "./recruitment.router.js";
import userRouter from "./user.router.js";
import serviceRouter from "./service.router.js";
import specialtyRouter from "./specialty.router.js";
import introduceRouter from "./introduce.router.js";
import contactRouter from "./contact.router.js";


function route(app){
    app.use('/users',userRouter)
    app.use('/news', newsRouter);
    app.use('/doctors', doctorRouter);
    app.use('/recruitments', recruitmentRouter);
    app.use('/services', serviceRouter);
    app.use('/specialties', specialtyRouter);
    app.use('/introduces', introduceRouter);
    app.use('/contacts',contactRouter)
}

export default route;