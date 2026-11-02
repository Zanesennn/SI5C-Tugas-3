const cekApiKey = (req, res, next) => {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
        return res.status(401).json({
            status: "error",
            message: "API key wajib disertakan",
            data: null
        });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            status: "error",
            message: "API key tidak valid",
            data: null
        });
    }

    next();
};

module.exports = cekApiKey;