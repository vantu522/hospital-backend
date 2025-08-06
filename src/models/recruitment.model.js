import mongoose from 'mongoose';

const recruitmentSchema = new mongoose.Schema({
    title:{type:String, required:true},
    document: {type:String},
    slug:{type:String},
    expiry_date:{type:Date},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});



const Recruitment = mongoose.model('Recruitment', recruitmentSchema);

export default Recruitment;