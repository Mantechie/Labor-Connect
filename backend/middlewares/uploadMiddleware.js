import multer from 'multer'
import path from 'path'

// Storage config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/') // You can customize this folder
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    const uniqueName = `${file.fieldname}-${Date.now()}${ext}`
    cb(null, uniqueName)
  },
})

// File type filter (optional: accept images/videos/docs only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|mov|avi/

  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only images/videos/documents allowed!'))
  }
}

// Upload middleware
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max file size
  fileFilter,
})
