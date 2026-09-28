const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");


app.use(express.json());

app.use(function (req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, "public")));

function readItems() {
    return JSON.parse(
        fs.readFileSync(DATA_FILE, "utf8")
    );
}

function writeItems(items) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(items, null, 2),
        "utf8"
    );
}

app.get("/api/items", (req, res) => {
    try {
        let items = readItems();

        if (req.query.category) {
            items = items.filter(
                item => item.category === req.query.category
            );
        }

        res.status(200).json(items);

    } catch {
        res.status(500).json({
            error: "Ошибка сервера"
        });
    }
});

app.get("/api/items/:id", (req, res) => {
    try {

        const id = Number(req.params.id);
        const items = readItems();

        const item = items.find(
            item => item.id === id
        );

        if (!item) {
            return res.status(404).json({
                error: "Место не найдено"
            });
        }

        res.status(200).json(item);

    } catch {
        res.status(500).json({
            error: "Ошибка сервера"
        });
    }
});

app.get("/api/filter", (req, res) => {
    try {

        const items = readItems();

        const result = items.filter(
            item => item.time === req.query.time
        );

        res.status(200).json(result);

    } catch {
        res.status(500).json({
            error: "Ошибка сервера"
        });
    }
});

app.post("/api/items", (req, res) => {

    const newItem = req.body;

    if (
        !newItem.title ||
        !newItem.category ||
        !newItem.description
    ) {
        return res.status(400).json({
            error: "Заполнены не все поля"
        });
    }

    try {

        const items = readItems();

        const maxId =
            items.length > 0
                ? Math.max(...items.map(i => i.id))
                : 0;

        newItem.id = maxId + 1;

        items.push(newItem);

        writeItems(items);

        res.status(201).json(newItem);

    } catch {
        res.status(500).json({
            error: "Ошибка сервера"
        });
    }
});

app.delete("/api/items/:id", (req, res) => {

    try {

        const id = Number(req.params.id);

        let items = readItems();

        const found = items.find(
            item => item.id === id
        );

        if (!found) {
            return res.status(404).json({
                error: "Место не найдено"
            });
        }

        items = items.filter(
            item => item.id !== id
        );

        writeItems(items);

        res.status(200).json({
            message: "Удалено"
        });

    } catch {
        res.status(500).json({
            error: "Ошибка сервера"
        });
    }
});

app.use((req, res) => {
    res.status(404).sendFile(
        path.join(__dirname, "public", "404.html")
    );
});

app.listen(PORT, () => {
    console.log(
        `Сервер запущен: http://localhost:${PORT}`
    );
});