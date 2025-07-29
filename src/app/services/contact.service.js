import Contact from "../../models/contact.js"; 


export async function create(requestBody){
    const contact = new Contact(requestBody);
    await contact.save();
    return contact;
}