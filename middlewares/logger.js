const logger = (req, res, next) => {
    const waktu = new Date().toLocaleString("id-ID");

    console.log(
        `[${waktu}] ${req.method} ${req.originalUrl}`
    );

    next();
};

module.exports = logger;