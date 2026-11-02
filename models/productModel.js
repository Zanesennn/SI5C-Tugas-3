const mongoose = require("mongoose");

// Membuat schema produk
const productSchema = new mongoose.Schema(
    {
        nama: {
            type: String,
            required: [true, "Nama produk wajib diisi"],
            trim: true
        },

        kategori: {
            type: String,
            required: [true, "Kategori produk wajib diisi"],
            trim: true
        },

        harga: {
            type: Number,
            required: [true, "Harga produk wajib diisi"],
            min: [0.01, "Harga harus lebih dari 0"]
        },

        stok: {
            type: Number,
            default: 0,
            min: [0, "Stok tidak boleh negatif"]
        },

        deskripsi: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Membuat model Product
const Product = mongoose.models.Product ||
    mongoose.model("Product", productSchema, "products");

module.exports = Product;