import clinicRoomRouter from "./clinic-room.router.js";
import timeSlotTemplateRouter from "./time-slot-template.router.js";
import doctorRouter from "./doctor.router.js";
import newsRouter from "./news.router.js";
import recruitmentRouter from "./recruitment.router.js";
import userRouter from "./user.router.js";
import serviceRouter from "./service.router.js";
import specialtyRouter from "./specialty.router.js";
import introduceRouter from "./introduce.router.js";
import contactRouter from "./contact.router.js";
import informationRouter from "./information.router.js";
import healthConsultationRouter from "./health-consultation.router.js";
import applicationRouter from "./application.router.js";
import backgroundBannerRouter from "./background-banner.router.js";
import healthInsuranceExamRouter from "./health-insurance-exam.router.js";
import customerRouter from "./customer.router.js";

function route(app){
    app.use('/api/users', userRouter)
    app.use('/api/news', newsRouter);
    app.use('/api/doctors', doctorRouter);
    app.use('/api/recruitments', recruitmentRouter);
    app.use('/api/services', serviceRouter);
    app.use('/api/specialties', specialtyRouter);
    app.use('/api/introduces', introduceRouter);
    app.use('/api/contacts', contactRouter)
    app.use('/api/informations', informationRouter);
    app.use('/api/health-consultations', healthConsultationRouter);
    app.use('/api/applications', applicationRouter);
    app.use('/api/background-banners', backgroundBannerRouter);
    app.use('/api/health-insurance-exams', healthInsuranceExamRouter);
    app.use('/api/customers', customerRouter);
    app.use('/api/clinic-rooms', clinicRoomRouter);
    app.use('/api/time-slot-templates', timeSlotTemplateRouter);
}

export default route;