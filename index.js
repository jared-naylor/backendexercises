const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

let phonebook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const retrieveContactById = (id) => {
  return phonebook.find((contact) => contact.id === id);
};

const generateNewId = () => {
  let max = Math.max(...phonebook.map((contact) => contact.id));
  return max + 1;
};

const nameMatch = (name) => {
  return phonebook.find((contact) => contact.name === name);
};

app.use(cors());

app.use(express.json());

morgan.token("contact", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens["contact"](req, res),
    ].join(" ");
  })
);

app.get("/api/persons", (request, response) => {
  response.json(phonebook);
});

app.get("/api/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${
      phonebook.length
    } people</p><p>${new Date().toString()}`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const contact = retrieveContactById(id);

  if (contact) {
    response.json(contact);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  phonebook = phonebook.filter((contact) => contact.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  let id = generateNewId();
  if (!request.body.name || !request.body.number) {
    response.status(404).json({ error: "Content missing" });
  } else if (nameMatch(request.body.name)) {
    response.status(404).json({ error: "name must be unique" });
  }

  let newContact = { id, ...request.body };
  phonebook = phonebook.concat(newContact);
  response.json(newContact);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.eng.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}...`);
});
