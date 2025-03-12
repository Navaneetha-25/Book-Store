const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let books = [
    { isbn: "12345", title: "Book One", author: "Author A", reviews: [] },
    { isbn: "67890", title: "Book Two", author: "Author B", reviews: [] }
];

let users = [];


app.get("/books", (req, res) => {
    res.json(books);
});


app.get("/books/isbn/:isbn", (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    book ? res.json(book) : res.status(404).json({ message: "Book not found" });
});


app.get("/books/author/:author", (req, res) => {
    const filteredBooks = books.filter(b => b.author === req.params.author);
    filteredBooks.length ? res.json(filteredBooks) : res.status(404).json({ message: "No books found" });
});


app.get("/books/title/:title", (req, res) => {
    const filteredBooks = books.filter(b => b.title.toLowerCase().includes(req.params.title.toLowerCase()));
    filteredBooks.length ? res.json(filteredBooks) : res.status(404).json({ message: "No books found" });
});


app.get("/books/review/:isbn", (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    book ? res.json(book.reviews) : res.status(404).json({ message: "No reviews found" });
});


app.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json("User already exists" );
    }
    users.push({ username, password });
    res.status(201).json("User registered successfully" );
});


app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    user ? res.json("Login successful") : res.status(401).json( "Invalid credentials" );
});


app.post("/books/review/:isbn", (req, res) => {
    const { username, review } = req.body;
    const book = books.find(b => b.isbn === req.params.isbn);
    if (!book) return res.status(404).json( "Book not found" );

    book.reviews.push({ username, review });
    res.json( "Review added successfully", book.reviews);
});


app.delete("/books/review/:isbn", (req, res) => {
    const { username } = req.body;
    const book = books.find(b => b.isbn === req.params.isbn);
    if (!book) return res.status(404).json( "Book not found" );

    book.reviews = book.reviews.filter(r => r.username !== username);
    res.json( "Review deleted", book.reviews );
});


const getAllBooks = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(books);
        }, 1000);
    });
};

app.get("/async-books", async (req, res) => {
    try {
        const bookList = await getAllBooks();
        res.json(bookList);
    } catch (error) {
        res.status(500).json( "Error fetching books" );
    }
});


const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books.find(b => b.isbn === isbn);
        book ? resolve(book) : reject("Book not found");
    });
};

app.get("/promise-books/isbn/:isbn", (req, res) => {
    getBookByISBN(req.params.isbn)
        .then(book => res.json(book))
        .catch(err => res.status(404).json({ message: err }));
});


const getBooksByAuthor = async (author) => {
    return books.filter(b => b.author === author);
};

app.get("/async-books/author/:author", async (req, res) => {
    try {
        const authorBooks = await getBooksByAuthor(req.params.author);
        res.json(authorBooks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author" });
    }
});


const getBooksByTitle = async (title) => {
    return books.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
};

app.get("/async-books/title/:title", async (req, res) => {
    try {
        const titleBooks = await getBooksByTitle(req.params.title);
        res.json(titleBooks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by title" });
    }
});


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
