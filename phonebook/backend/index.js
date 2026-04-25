require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

const Person = require("./models/person");

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

morgan.token("post-response", function (req, res) {
  if (req.method.toLowerCase() == "post") {
    const body = req.body;
    return JSON.stringify(body);
  } else {
    return "";
  }
});

app.use(express.json());
app.use(cors());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :post-response",
  ),
);
app.use(express.static("dist"));

app.get("/api/persons", (req, res) => {
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.number || !body.name) {
    return res.status(400).json("Name or number is missing");
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((result) => {
    res.json(result);
  });
});

app.put("/api/persons/:id", (req, res) => {
  const { name, number } = req.body;

  Person.findById(req.params.id)
    .then((person) => {
      if (!person) {
        return res.status(404).end();
      }

      person.name = name;
      person.number = number;

      return person.save().then((result) => {
        res.json(result);
      });
    })
    .catch((error) => next(error));
});

app.get("/info", (req, res) => {
  Person.find({}).then((people) => {
    const date = new Date();

    res.send(`<p>Phonebook has info for ${people.length} people</p>
    <p>${date}</p>`);
  });
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name == "CastError") {
    return res.error(400).send({ error: "malformatted id" });
  }

  next(error);
};

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
