import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import env from "dotenv";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 4000;
env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/new-blog", (req, res) => {
    res.render("new-blog.ejs");
});

app.get("/blogs", async (req, res) => {
    const read = await db.query(
        "SELECT * FROM blog"
    );

    res.render("blogs.ejs", { blogData: read });
});

app.post("/submit", async (req, res) => {
    let name = req.body["name"];
    let title = req.body["title"];
    let blog = req.body["blog"];
    try {
        await db.query(
            "INSERT INTO blog (name, title, blog) VALUES ($1, $2, $3);",
            [name, title, blog]
        );
    } catch (error) {
        res.render("error.ejs", { error: error });
    } 
    res.render("success.ejs");
});

app.get("/view-post", async (req, res) => {
    const postId = req.query.id;
    const read = await db.query(
        "SELECT * FROM blog WHERE id = $1;",
        [postId]
    );
    res.render("view-post.ejs", { data: read});
});

app.get("/update", async (req, res) => {
    const postId = req.query.id;
    const read = await db.query(
        "SELECT * FROM blog WHERE id = $1;",
        [postId]
    );
    res.render("update.ejs", { data: read});
});

app.post("/save", async (req, res) => {
    let name = req.body["name"];
    let title = req.body["title"];
    let blog = req.body["blog"];
    const postId = req.query.id;
    try {
        await db.query(
            "UPDATE blog SET name = $1, title = $2, blog = $3 WHERE id = $4;",
            [name, title, blog, postId]
        );
    } catch (error) {
        res.render("error.ejs");
    } 
    res.render("save-success.ejs");
});

app.get("/delete", async (req, res) => {
    const postId = req.query.id;
    await db.query(
        "DELETE FROM blog WHERE id = $1",
        [postId]
    );
    res.render("delete.ejs");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});