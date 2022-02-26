require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Bcryptjs = require("bcryptjs");

app = express();

const Admin = require("./models/admin.model");
const User = require("./models/user.model");
const Book = require("./models/book.model");
const Bookings = require("./models/bookings.model");

const saltRounds = 10;

mongoose
  .connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => {
    console.log("No Internet!");
  });

port = process.env.PORT;

app.use(express.json({ limit: "50mb" }));
app.use(cors());

const router = express.Router();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", (req, res) => {
  console.log(req.body);
  Registerto = null;
  if (req.body.isAdmin) {
    Registerto = Admin;
  } else {
    Registerto = User;
  }

  Registerto.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send("Error on the server. :(");
    if (user)
      return res
        .status(409)
        .send("Email already exists. Please try logging in!");
    if (req.body.password.length < 8)
      return res
        .status(409)
        .send("Password must be at least 8 characters long!");
    if (req.body.password !== req.body.reenteredpassword)
      return res.status(409).send("Passwords do not match!");
    if (Registerto === Admin) {
      Admin.findOne({}, (err, admin) => {
        if (err) return res.status(500).send("Error on the server. :(");
        if (
          admin &&
          !Bcryptjs.compareSync(req.body.adminPass, admin[0].password)
        )
          return res.status(409).send("Admin password is incorrect!");
        Admin.deleteOne({}, (err) => {
          if (err) return res.status(500).send("Error on the server. :(");
        });
      });
    }

    var obj = {
      username: req.body.username,
      password: Bcryptjs.hashSync(req.body.password, saltRounds),
      email: req.body.email,
      securitykey: req.body.securitykey,
    };

    if (Registerto !== Admin) {
      Object.assign(obj, { booksBorrowed: 0 });
      Object.assign(obj, { booksBorrowedCount: 0 });
      Object.assign(obj, { booksBorrowedLimit: 10 });
      Object.assign(obj, { booksBorrowedLimitReached: false });
    }

    console.log(obj, Registerto === User);

    Registerto.create(obj, (err, results) => {
      if (err) return res.status(500).send("Error on the server.");
      res.status(200).send("User registered successfully!");
    });
  });
});

app.post("/login", (req, res) => {
  console.log(req.body);
  var Logger = null;
  if (req.body.isAdmin) {
    Logger = Admin;
  } else {
    Logger = User;
  }
  Logger.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send("Error on the server.");
    console.log(user.username);
    if (!user)
      return res
        .status(404)
        .send("Password is incorrect or the email doesn't exist!");
    const passwordIsValid = Bcryptjs.compareSync(
      req.body.password,
      user.password
    );
    if (!passwordIsValid)
      return res
        .status(401)
        .send("Password is incorrect or the email doesn't exist!");
    else
      return res.status(200).send({
        user: user,
        isAdmin: Logger === Admin,
      });
  });
});

app.post("/verifydetails", (req, res) => {
  console.log(req.body);
  var Logger = null;
  if (req.body.isAdmin) {
    Logger = Admin;
  } else {
    Logger = User;
  }
  Logger.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send("Error on the server.");
    console.log(user.username);
    if (!user)
      return res
        .status(404)
        .send("Password is incorrect or the email doesn't exist!");
    const passwordIsValid = req.body.password === user.password;
    console.log(req.body.password, user.password);
    if (!passwordIsValid)
      return res
        .status(401)
        .send("Password is incorrect or the email doesn't exist!");
    else
      return res.status(200).send({
        user: user,
        isAdmin: Logger === Admin,
      });
  });
});

app.post("/borrowedbooks", (req, res) => {
  if (req.body.email === undefined) res.status(409).send("No email Provided");
  else {
    console.log("The mail is : ", req.body.email);
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(500).send("Error on the server.");
      else if (!user) return res.status(404).send("No user found");
      else {
        console.log(user);
        Book.find({ isbn: { $in: user.booksBorrowed } }, (err, books) => {
          if (err) return res.status(500).send("Error on the server.");
          res.status(200).send({ results: books });
        });
      }
    });
  }
});

app.post("/todaysdue", (req, res) => {
  var date = new Date(new Date(Date.now()).toISOString().split("T")[0])
  Bookings.find({
    email: req.body.email,
    bookReturned: false,
    bookReturnDate: {
      $lt: date,
    },
  }, (err, bookings) => {
    if (err) return res.status(500).send("Error on the server.");
    res.status(200).send({ results: bookings });
  });
});

app.post("/addbook", (req, res) => {
  Book.findOne({ isbn: req.body.isbn }, (err, book) => {
    if (err) return res.status(500).send("Error on the server.");
    if (book) {
      book.originalQuantity =
        Number(book.originalQuantity) + Number(req.body.quantity);
      book.currentQuantity =
        Number(book.currentQuantity) + Number(req.body.quantity);
      book.save(function (err) {
        if (err) return res.status(500).send("Error on the server.");
        res.status(200).send("Book added successfully!");
      });
    } else {
      Book.create(
        {
          bookName: req.body.bookName,
          authorName: req.body.authorName,
          description: req.body.description,
          isbn: req.body.isbn,
          genre: req.body.genre,
          base64BookImage: req.body.base64BookImage,
          base64AuthorImage: req.body.base64AuthorImage,
          rating: req.body.rating,
          originalQuantity: req.body.quantity,
          currentQuantity: req.body.quantity,
        },
        (err, results) => {
          if (err) return res.status(500).send("Error on the server.");
          res.status(200).send("Book added successfully!");
        }
      );
    }
  });
});

app.post("/orderbook", (req, res) => {
  Book.findOne({ isbn: req.body.isbn }, (err, book) => {
    if (err) return res.status(500).write("Error on the server.");
    if (!book) return res.status(404).write("Book not found!");
    if (book.currentQuantity === 0)
      return res.status(409).write("Not enough books in stock!");
    book.currentQuantity = book.currentQuantity - 1;
    book.save(function (err) {
      if (err) return res.status(500).write("Error on the server.");
    });
  });
  User.find({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).write("Error on the server.");
    if (!user) return res.status(404).send("User not found!");
    if (user[0].booksBorrowedCount === user[0].booksBorrowedLimit) {
      return res
        .status(409)
        .send("You have reached the limit of books you can borrow!");
    } else if (!user[0].booksBorrowed.includes(req.body.isbn)) {
      canAdd = true;
      user[0].booksBorrowedCount = user[0].booksBorrowedCount + 1;
      user[0].booksBorrowed.push(req.body.isbn);
      user[0].save(function (err) {
        if (err) return res.status(500).write("Error on the server.");
      });
      Bookings.create({ ...req.body, reorder: false }, (err, results) => {
        if (err) return res.status(500).send("Error on the server.");
        res.status(200).send("Book ordered successfully!");
      });
    } else res.status(409).send("You have already borrowed the book!");
  });
});

app.get("/book/:filter", (req, res) => {
  var filters = req.params.filter.split("&");
  var startvalue = Number(filters[filters.length - 2]);
  var nperpage = Number(filters[filters.length - 1]);
  var searchedItem = filters[filters.length - 3].startsWith("search=")
    ? filters[filters.length - 3].substr(7)
    : null;
  var tofilterobj = {};
  console.log(typeof startvalue, typeof nperpage, filters);

  if (filters.includes("All")) tofilterobj = {};
  else tofilterobj = { genre: { $in: filters } };

  console.log(tofilterobj);

  if (searchedItem != null)
    Object.assign(tofilterobj, {
      $or: [
        { bookName: { $regex: searchedItem, $options: "i" } },
        { authorName: { $regex: searchedItem, $options: "i" } },
      ],
    });

  Book.paginate(
    tofilterobj,
    { page: startvalue, limit: nperpage },
    (err, results) => {
      if (err) return res.status(500).send("Error on the server.");
      res.status(200).send({ results: results.docs, total: results.total });
    }
  );
});

app.get("/bookreturns/:filter", (req, res) => {
  var filter = req.params.filter;
  var todaysdate = new Date().toISOString().split("T")[0];
  var obj = { bookReturnDate: todaysdate };
  if(filter !== 'NONE') obj['email'] = filter;
  console.log("OBJ", obj);
  Bookings.find(obj, (err, results) => {
    if (err) return res.status(500).send("Error on the server.");
    bookNames = [];
    bookisbn = results.map((book) => book.isbn);
    if(filter) {
      Book.find({isbn : {$in : bookisbn}}, (err, books) => {
        res.status(200).send({results : results, bookNames : books});
      });
    }
    else
    res.status(200).send({ results: results});
  });
});

app.post("/reorderbook", (req, res) => {
  Bookings.findOne(
    { email: req.body.email, isbn: req.body.isbn },
    (err, results) => {
      if (err) return res.status(500).send("Error on the server.");
      if (!results) return res.status(404).send("Book not found!");
      if (results.reorder)
        return res.status(409).send("Book already reordered!");
      results.reorder = true;
      var date = new Date(Date.now());
      date.setDate(date.getDate() + Number(req.body.days));
      date = new Date(date.toISOString().split("T")[0]);
      results.bookReturnDate = date;
      results.save(function (err) {
        if (err) return res.status(500).send("Error on the server.");
      });
      res.status(200).send("Book reordered successfully!");
    }
  );
});

app.post("/returnbook", (req, res) => {
  Bookings.findOne(
    { email: req.body.email, isbn: req.body.isbn },
    (err, results) => {
      if (err) return res.status(500).send("Error on the server.");
      if (!results) return res.status(404).send("Book not found!");
      results.bookReturned = true;
      results.bookReturnDate = new Date(new Date().toISOString().split("T")[0]);
      results.save((err) => {
        if (err) return res.status(500).send("Error on the server.");
      });
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return res.status(500).send("Error on the server.");
        if (!user) return res.status(404).send("User not found!");
        user.booksBorrowedCount = user.booksBorrowedCount - 1;
        user.booksBorrowed = user.booksBorrowed.filter(
          (book) => book !== req.body.isbn
        );
        user.save(function (err) {
          if (err) return res.status(500).send("Error on the server.");
        });
      });
      res.status(200).send("Book returned successfully!");
    }
  );
});

app.listen(port, (req, res) => {
  console.log("Server is running on port: " + port);
});
