import multer from "multer";

const uploadKnowledgePdf = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const isPdf =
      file.mimetype === "application/pdf";

    if (!isPdf) {
      return callback(
        new Error("Only PDF files are allowed."),
      );
    }

    callback(null, true);
  },
});

export {
  uploadKnowledgePdf,
};