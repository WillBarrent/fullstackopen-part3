const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

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

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const { id } = req.params;
  const person = persons.find((p) => p.id == id);

  if (person) {
    return res.json(person);
  }

  return res.status(404).end();
});

app.delete("/api/persons/:id", (req, res) => {
  const { id } = req.params;
  persons = persons.filter((p) => p.id != id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.number || !body.name) {
    return res.status(400).json("Name or number is missing");
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 100000),
  };

  const isNotUnique = persons.find((p) => p.name === person.name);

  if (isNotUnique) {
    return res.status(400).json("Name must be unique");
  }

  persons = persons.concat(person);

  res.json(person);
});

app.get("/info", (req, res) => {
  const date = new Date();

  res.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>`);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
