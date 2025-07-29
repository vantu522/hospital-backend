import createModel from "./base.js";

const Contact = createModel(
    'Contact',
    'contacts',
    {
        full_name:{
            type:String,
            required:true,
        },
        phone_number:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
        },
        message:{
            type:String,
            required:true,
        }
    }
)

export default Contact;