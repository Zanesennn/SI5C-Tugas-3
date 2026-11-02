const dotenv = require("dotenv");

// Membaca file .env terlebih dahulu
dotenv.config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const logger = require("./middlewares/logger");
const productRoutes = require("./routes/productRoutes");

const {
    notFound,
    errorHandler
} = require("./middlewares/errorHandler");

// Membuat aplikasi Express
const app = express();

// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================

// Mengizinkan akses dari client lain
app.use(cors());

// Membaca request body JSON
app.use(express.json());

// Logger
app.use(logger);

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        nama_mahasiswa: "Zanesen",
        nim: "2327240066",
        topik: 2,
        resource: "products",
        database: "MongoDB",
        fitur: [
            "CRUD Products",
            "Filtering",
            "Pagination",
            "Sorting",
            "Projection"
        ],
        endpoints: [
            "GET /products",
            "GET /products/:id",
            "POST /products",
            "PUT /products/:id",
            "DELETE /products/:id",
            "GET /products?kategori=elektronik",
            "GET /products?page=1&limit=5",
            "GET /products?sort=-harga",
            "GET /products?fields=nama,harga,stok",
            "GET /products?hargaMin=10000&hargaMax=500000",
            "GET /products?stokMin=10"
        ]
    });
});

// ==========================================
// ROUTES
// ==========================================

app.use("/products", productRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================

// Jika URL tidak ditemukan
app.use(notFound);

// Penanganan semua error
app.use(errorHandler);

// ==========================================
// KONEKSI DATABASE DAN SERVER
// ==========================================

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Validasi URL MongoDB
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI belum diatur di file .env");
        }

        // Menghubungkan aplikasi ke MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB berhasil terhubung!");

        // Menjalankan server setelah database terhubung
        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Gagal menjalankan aplikasi:", error.message);
        process.exit(1);
    }
};

// Menjalankan aplikasi
startServer();