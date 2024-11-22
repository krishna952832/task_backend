const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const atob = require("atob");
const fs = require("fs");
const cors = require("cors");

const app = express();

// Enable CORS for all origins (or use specific origin)
app.use(cors());  // This enables CORS for all origins

// Middleware to parse JSON
app.use(bodyParser.json()); // For parsing JSON data in the request body

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save the image in 'uploads/' directory
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Use the original file name and add a timestamp to avoid collisions
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Only accept image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Create uploads directory if not exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Handle GET requests
app.get("/bfhl", (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

// Handle POST requests
app.post("/bfhl", upload.single("image"), (req, res) => {
  let { data, file_b64 } = req.body;
  const file = req.file; // Handle the uploaded file

  try {
    // Parse the data if it is a string (from FormData)
    if (typeof data === "string") {
      data = JSON.parse(data); // Parse the JSON data
    }

    // Validate if data is an array
    if (!Array.isArray(data)) {
      return res.status(400).json({ is_success: false, message: "Invalid data format" });
    }

    // Process Base64 string if provided (you can choose to store or validate it)
    if (file_b64) {
      try {
        const decodedFile = atob(file_b64); // Decode the Base64 string if needed
        console.log("Decoded Base64 String:", decodedFile); // You can process it further if needed
      } catch (e) {
        console.error("Invalid Base64 string", e);
      }
    }

    // Initialize response fields
    const numbers = [];
    const alphabets = [];
    let highestLowercase = "";
    let isPrimeFound = false;

    // Process the input data
    data.forEach((item) => {
      if (/^\d+$/.test(item)) {
        const num = parseInt(item, 10);
        numbers.push(item);

        // Check if number is prime
        if (
          num > 1 &&
          Array.from({ length: num - 2 }, (_, i) => i + 2).every((i) => num % i !== 0)
        ) {
          isPrimeFound = true;
        }
      } else if (/^[a-zA-Z]$/.test(item)) {
        alphabets.push(item);

        // Track the highest lowercase letter
        if (
          /^[a-z]$/.test(item) &&
          (!highestLowercase || item > highestLowercase)
        ) {
          highestLowercase = item;
        }
      }
    });

    // Prepare response with file details
    const response = {
      is_success: true,
      user_id: "john_doe_17091999",
      email: "john@xyz.com",
      roll_number: "ABCD123",
      numbers,
      alphabets,
      highest_lowercase_alphabet: highestLowercase ? [highestLowercase] : [],
      is_prime_found: isPrimeFound,
      file_valid: !!file,
      file_mime_type: file ? file.mimetype : null,
      file_size_kb: file ? Math.ceil(file.size / 1024) : null,
    //   file_path: file ? `/uploads/${file.filename}` : null, // Image path
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ is_success: false, message: "Invalid JSON format" });
  }
});

// Port configuration
const PORT = process.env.PORT || 3000;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle port conflicts
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Exiting...`);
    process.exit(1);
  } else {
    throw err;
  }
});
