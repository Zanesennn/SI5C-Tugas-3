// Menambahkan contoh data jika koleksi masih kosong.
// Tidak menghapus data pengguna.

require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/productModel");

async function main() {
    // Validasi koneksi MongoDB
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI belum diatur di file .env");
    }

    // Koneksi ke MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB berhasil terhubung!");

    // Memeriksa jumlah data produk
    const total = await Product.countDocuments();

    if (total > 0) {
        console.log(
            `Seed dilewati: sudah ada ${total} data produk.`
        );
        return;
    }

    // Contoh data produk
    const contoh = [
        {
            nama: "Mouse Wireless",
            kategori: "elektronik",
            harga: 125000,
            stok: 40,
            deskripsi: "Mouse 2.4 GHz, baterai AA"
        },
        {
            nama: "Keyboard Mechanical",
            kategori: "elektronik",
            harga: 350000,
            stok: 25,
            deskripsi: "Keyboard mechanical RGB"
        },
        {
            nama: "Tas Laptop",
            kategori: "aksesoris",
            harga: 200000,
            stok: 15,
            deskripsi: "Tas laptop ukuran 15 inch"
        },
        {
            nama: "Headset Gaming",
            kategori: "elektronik",
            harga: 275000,
            stok: 30,
            deskripsi: "Headset gaming dengan microphone"
        },
        {
            nama: "Mouse Pad",
            kategori: "aksesoris",
            harga: 50000,
            stok: 50,
            deskripsi: "Mouse pad gaming ukuran besar"
        },
        {
            nama: "Flashdisk 32GB",
            kategori: "elektronik",
            harga: 75000,
            stok: 35,
            deskripsi: "Flashdisk USB kapasitas 32GB"
        },
        {
            nama: "Tas Selempang",
            kategori: "aksesoris",
            harga: 150000,
            stok: 20,
            deskripsi: "Tas selempang untuk kebutuhan sehari-hari"
        },
        {
            nama: "Monitor LED",
            kategori: "elektronik",
            harga: 1500000,
            stok: 12,
            deskripsi: "Monitor LED 22 inch"
        }
    ];

    // Memasukkan data ke MongoDB
    await Product.insertMany(contoh);

    console.log(
        `Seed selesai: ${contoh.length} data produk berhasil dibuat.`
    );
}

// Menjalankan seed
main()
    .catch((err) => {
        console.error("Seed gagal:", err.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });