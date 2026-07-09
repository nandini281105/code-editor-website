const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const connectDB = require("./db");
const codeRoutes = require("./routes/codeRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

connectDB();

const root = path.join(__dirname, "../");
app.use(express.static(root));

app.get("/", (req, res) => {const PORT = 3001;
    res.sendFile(path.join(root, "index.html"));
});

app.post("/run", async (req, res) => {
    const { language_id, source_code } = req.body;

    try {
        const response = await axios.post(
            "https://ce.judge0.com/submissions?wait=true",
            { language_id, source_code },
            { headers: { "Content-Type": "application/json" } }
        );

        res.json({
            output:
                response.data.stdout ||
                response.data.compile_output ||
                response.data.stderr ||
                "No output"
        });

    } catch (err) {
        res.json({ error: err.message });
    }
});

app.use("/api", codeRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});