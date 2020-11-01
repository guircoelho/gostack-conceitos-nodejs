const express = require("express");
const { v4: uuid, validate: isUuid } = require('uuid');
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function isValidGithub(request, response, next) {
  const { url } = request.body;

  if (url && !url.match(/github\.com/)) {
    return response.status(400).json({error: 'Invalid Github repository'});
  }

  return next();
}

function isValidUuid(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({error: 'Invalid ID format'});
  }

  return next();
}

function findRepositoryIndexById(id) {
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  if (repositoryIndex < 0) {
    return false;
  }

  return repositoryIndex;
}

function repositoryNotFound(response){
  response.status(400).json({ error: 'Repository not found' });
}

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", isValidGithub, (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", isValidUuid, isValidGithub, (request, response) => {
  const { id } = request.params;

  const repositoryIndex = findRepositoryIndexById(id);
  if (repositoryIndex === false) {
    return repositoryNotFound(response);
  }

  const repository = repositories[repositoryIndex];

  const { title, url, techs } = request.body;
  if (title) repository.title = title;
  if (url) repository.url = url;
  if (techs) repository.techs = techs;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = findRepositoryIndexById(id);
  if (repositoryIndex === false) {
    return repositoryNotFound(response);
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = findRepositoryIndexById(id);
  if (repositoryIndex === false) {
    return repositoryNotFound(response);
  }

  const repository = repositories[repositoryIndex];
  repository.likes++;

  return response.json(repository);
});

module.exports = app;
