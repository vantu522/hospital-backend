import Contact from "../../models/contact.js"; 


export async function create(requestBody){
    const contact = new Contact(requestBody);
    await contact.save();
    return contact;
}

export async function deleteContact(id) {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
        throw new Error('Contact not found');
    }
    return contact;
}

export async function deleteAllContacts() {
    return await Contact.deleteMany({});
 
}
export async function getAllContacts(page = 1, limit = 10) {
    const  skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
        Contact.find().skip(skip).limit(limit),
        Contact.countDocuments()
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    return {
        data,
        pagiantion:{
            page,
            limit,
            totalItems,
            totalPages
        }
    }
}