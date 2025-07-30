import createModel from "./base.js";

const Contact = createModel(
    'Contact',
    'contacts',
    {
        hoTen:{
            type:String,
            required:true,
        },
        soDienThoai:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
        },
        loiNhan:{
            type:String,
            required:true,
        }
    }
)

export default Contact;