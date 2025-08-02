import slugify from "slugify";

export const generateSlug = (name) => {
  if (!name) return "";

  return slugify(name, {
    lower: true,           // chuyển về chữ thường
    strict: true,          // loại bỏ ký tự đặc biệt (chỉ giữ a-z, 0-9, -)
    locale: "vi",          // xử lý tốt tiếng Việt
    remove: /[*+~.()'"!:@?%&#^$={}<>]/g, // loại các ký tự không mong muốn khác
  });
};
