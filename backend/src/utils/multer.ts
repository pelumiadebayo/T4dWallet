import multer from "multer";
import * as path from "path";
import * as fs from "fs";

const uploadDir = "public/file-uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const imageUpload = multer({
  storage: fileStorage,
  fileFilter: function (req, file, cb: any) {
    const ext = path.extname(file.originalname);
    if (![".jpg", ".jpeg", ".png"].includes(ext.toLowerCase())) {
      cb(new Error("File type is not supported"), false);
      return;
    }
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format"));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});
