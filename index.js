require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Contact = require("./models/contact");
const contact = require("./models/contact");
const app = express();

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted ID" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
};

app.use(express.static("build"));

app.use(cors());

app.use(express.json());

morgan.token("contact", function (req, res) {
  return JSON.stringify(req.body);
});

const createNewContact = (request, response, next) => {
  let newContact = new Contact({ ...request.body });
  newContact
    .save()
    .then((contact) => response.json(contact))
    .catch((error) => next(error));
};

const updateExistingContact = (request, response, next) => {
  const body = request.body;

  const contact = {
    name: body.name,
    number: body.number,
  };

  Contact.findByIdAndUpdate(request.params.id, contact, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedContact) => {
      response.json(updatedContact);
    })
    .catch((error) => next(error));
};

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

app.get("/api/persons", (request, response, next) => {
  Contact.find({})
    .then((contacts) => {
      response.json(contacts);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  const contact = Contact.findById(request.params.id)
    .then((contact) => {
      response.json(contact);
    })
    .catch((error) => next(error));
});

app.get("/api/info", (request, response, next) => {
  Contact.find({})
    .then((contacts) => {
      response.send(
        `<p>Phonebook has info for ${
          contacts.length
        } people</p><p>${new Date().toString()}</p>`
      );
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", createNewContact);

app.put("/api/persons/:id", updateExistingContact);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}...`);
});
