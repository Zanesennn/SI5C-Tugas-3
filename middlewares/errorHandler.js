// Middleware 404
const notFound = (req, res, next) => {
    const error = new Error("Endpoint tidak ditemukan");
    error.status = 404;

    next(error);
};

// Error handler
const errorHandler = (err, req, res, next) => {
    console.error("ERROR:", err.message);

    // JSON rusak dari express.json()
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            status: "error",
            message: "Format JSON tidak valid",
            data: null
        });
    }

    const statusCode = err.status || 500;

    res.status(statusCode).json({
        status: "error",
        message: err.message || "Terjadi kesalahan pada server",
        data: null
    });
};

module.exports = {
    notFound,
    errorHandler
};