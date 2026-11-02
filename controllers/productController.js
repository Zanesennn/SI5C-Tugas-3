const mongoose = require("mongoose");
const Product = require("../models/productModel");
const { errorHttp } = require("../middlewares/errorHandler");

// Field yang boleh digunakan untuk sorting dan projection
const SORT_FIELDS = [
    "nama",
    "kategori",
    "harga",
    "stok",
    "createdAt"
];

const SELECT_FIELDS = [
    "nama",
    "kategori",
    "harga",
    "stok",
    "deskripsi",
    "createdAt",
    "updatedAt"
];

// Membatasi nilai pagination
function safeInteger(value, fallback, min, max) {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed)) {
        return fallback;
    }

    return Math.min(Math.max(parsed, min), max);
}

// Memvalidasi ObjectId MongoDB
function validateId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw errorHttp(400, "Format ID tidak valid");
    }
}

// Memvalidasi parameter angka
function validateNumber(value, fieldName) {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
        throw errorHttp(
            400,
            `${fieldName} harus berupa angka dan tidak boleh negatif`
        );
    }

    return number;
}

// GET /products
// Filtering, pagination, sorting, dan projection
exports.getProducts = async (req, res) => {
    const filter = {};

    // Filtering berdasarkan kategori
    if (req.query.kategori) {
        filter.kategori = {
            $regex: `^${String(req.query.kategori).trim()}$`,
            $options: "i"
        };
    }

    // Filtering berdasarkan harga minimum
    if (req.query.hargaMin !== undefined) {
        filter.harga = {
            ...filter.harga,
            $gte: validateNumber(req.query.hargaMin, "hargaMin")
        };
    }

    // Filtering berdasarkan harga maksimum
    if (req.query.hargaMax !== undefined) {
        filter.harga = {
            ...filter.harga,
            $lte: validateNumber(req.query.hargaMax, "hargaMax")
        };
    }

    // Validasi rentang harga
    if (
        req.query.hargaMin !== undefined &&
        req.query.hargaMax !== undefined &&
        Number(req.query.hargaMin) > Number(req.query.hargaMax)
    ) {
        throw errorHttp(400, "hargaMin tidak boleh lebih besar dari hargaMax");
    }

    // Filtering berdasarkan stok minimum
    if (req.query.stokMin !== undefined) {
        filter.stok = {
            $gte: validateNumber(req.query.stokMin, "stokMin")
        };
    }

    // Pagination
    const page = safeInteger(req.query.page, 1, 1, 1000000);
    const limit = safeInteger(req.query.limit, 10, 1, 100);

    // Sorting
    const sortParam = String(req.query.sort || "-createdAt");

    const sortField = sortParam.startsWith("-")
        ? sortParam.slice(1)
        : sortParam;

    if (!SORT_FIELDS.includes(sortField)) {
        throw errorHttp(
            400,
            `sort hanya boleh: ${SORT_FIELDS.join(", ")} atau awali dengan tanda - untuk urutan menurun`
        );
    }

    const sortDirection = sortParam.startsWith("-") ? -1 : 1;

    // Projection
    let projection = "";

    if (req.query.fields) {
        const fields = String(req.query.fields)
            .split(",")
            .map(field => field.trim())
            .filter(Boolean);

        if (
            !fields.length ||
            !fields.every(field => SELECT_FIELDS.includes(field))
        ) {
            throw errorHttp(
                400,
                `fields hanya boleh: ${SELECT_FIELDS.join(", ")}`
            );
        }

        projection = fields.join(" ");
    }

    // Query MongoDB
    const query = Product.find(filter)
        .select(projection)
        .sort({
            [sortField]: sortDirection,
            _id: 1
        })
        .skip((page - 1) * limit)
        .limit(limit);

    // Mengambil data dan total data secara bersamaan
    const [data, total] = await Promise.all([
        query,
        Product.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        },
        query: {
            kategori: req.query.kategori || null,
            hargaMin: req.query.hargaMin || null,
            hargaMax: req.query.hargaMax || null,
            stokMin: req.query.stokMin || null,
            sort: sortParam,
            fields: req.query.fields || "semua"
        },
        data
    });
};

// GET /products/:id
exports.getProductById = async (req, res) => {
    validateId(req.params.id);

    const data = await Product.findById(req.params.id);

    if (!data) {
        throw errorHttp(404, "Data produk tidak ditemukan");
    }

    res.status(200).json({
        success: true,
        data
    });
};

// POST /products
exports.createProduct = async (req, res) => {
    const {
        nama,
        kategori,
        harga,
        stok,
        deskripsi
    } = req.body;

    // Validasi field wajib
    if (
        !nama ||
        !kategori ||
        harga === undefined ||
        harga === null
    ) {
        throw errorHttp(
            400,
            "nama, kategori, dan harga wajib diisi"
        );
    }

    // Validasi nama dan kategori
    if (
        typeof nama !== "string" ||
        !nama.trim() ||
        typeof kategori !== "string" ||
        !kategori.trim()
    ) {
        throw errorHttp(
            400,
            "nama dan kategori harus berupa teks yang valid"
        );
    }

    // Validasi harga
    const hargaNumber = Number(harga);

    if (!Number.isFinite(hargaNumber) || hargaNumber <= 0) {
        throw errorHttp(
            400,
            "harga harus berupa angka lebih dari 0"
        );
    }

    // Validasi stok
    const stokNumber = stok === undefined ? 0 : validateNumber(stok, "stok");

    // Membuat produk baru
    const data = await Product.create({
        nama: nama.trim(),
        kategori: kategori.trim(),
        harga: hargaNumber,
        stok: stokNumber,
        deskripsi
    });

    res.status(201).json({
        success: true,
        message: "Data produk berhasil ditambahkan",
        data
    });
};

// PUT /products/:id
exports.updateProduct = async (req, res) => {
    validateId(req.params.id);

    const data = await Product.findById(req.params.id);

    if (!data) {
        throw errorHttp(404, "Data produk tidak ditemukan");
    }

    const {
        nama,
        kategori,
        harga,
        stok,
        deskripsi
    } = req.body;

    const updateData = {};

    // Validasi nama
    if (nama !== undefined) {
        if (typeof nama !== "string" || !nama.trim()) {
            throw errorHttp(400, "nama tidak boleh kosong");
        }

        updateData.nama = nama.trim();
    }

    // Validasi kategori
    if (kategori !== undefined) {
        if (typeof kategori !== "string" || !kategori.trim()) {
            throw errorHttp(400, "kategori tidak boleh kosong");
        }

        updateData.kategori = kategori.trim();
    }

    // Validasi harga
    if (harga !== undefined) {
        const hargaNumber = Number(harga);

        if (!Number.isFinite(hargaNumber) || hargaNumber <= 0) {
            throw errorHttp(
                400,
                "harga harus berupa angka lebih dari 0"
            );
        }

        updateData.harga = hargaNumber;
    }

    // Validasi stok
    if (stok !== undefined) {
        updateData.stok = validateNumber(stok, "stok");
    }

    // Update deskripsi
    if (deskripsi !== undefined) {
        updateData.deskripsi = deskripsi;
    }

    if (Object.keys(updateData).length === 0) {
        throw errorHttp(400, "Tidak ada data yang dikirim untuk diperbarui");
    }

    const updatedData = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        message: "Data produk berhasil diperbarui",
        data: updatedData
    });
};

// DELETE /products/:id
exports.deleteProduct = async (req, res) => {
    validateId(req.params.id);

    const data = await Product.findByIdAndDelete(req.params.id);

    if (!data) {
        throw errorHttp(404, "Data produk tidak ditemukan");
    }

    res.status(200).json({
        success: true,
        message: "Data produk berhasil dihapus",
        data
    });
};