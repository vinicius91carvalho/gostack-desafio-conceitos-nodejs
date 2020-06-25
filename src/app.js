const express = require("express")
const cors = require("cors")
const { uuid, isUuid } = require("uuidv4")

const app = express()

app.use(express.json())
app.use(cors())

function getRepositoryIndex(id, response) {
  const repositoryIndex = repositories.findIndex(repository => repository.id == id)
  if (repositoryIndex < 0) 
    return response.status(400).json({ message: 'Repositório inexistente'})
  return repositoryIndex
}

function isValidID(request, response, next) {
  const { id: paramId } =  request.params
  const { id: bodyId } = request.body

  if (paramId && !isUuid(paramId))
    return response.status(400).json({ message: 'O ID informado na URL não é um UUID válido' })
  
  if (bodyId && !isUuid(bodyId))
    return response.status(400).json({ message: 'O ID informado no repositório não é um UUID válido' })

  next()
}

app.use('/repositories/:id', isValidID)
app.use('/repositories/:id/like', isValidID)

const repositories = []

app.get("/repositories", (request, response) => {
  return response.json(repositories);
})

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body
  const newRepository = {
    id: uuid(),
    title, 
    url, 
    techs,
    likes: 0
  } 
  repositories.push(newRepository)
  response.status(201).json(newRepository)
})

app.put("/repositories/:id", (request, response) => {
  const { id, title, url, techs } = request.body
  if (id && id !== request.params.id)
    return response.status(400).json({ message: 'O ID informado na rota é diferente do ID do repositório'})
  
  const repositoryIndex = getRepositoryIndex(request.params.id, response)

  Object.assign(repositories[repositoryIndex], 
    {
      title,
      url,
      techs,
    }
  )

  response.status(200).json(repositories[repositoryIndex])
})

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params

  const repositoryIndex = getRepositoryIndex(id, response)
  
  repositories.splice(repositoryIndex, 1)

  response.status(204).send()
})

app.post("/repositories/:id/like", (request, response) => {
  
  const { id } = request.params

  const repositoryIndex = getRepositoryIndex(id, response)

  console.log(repositories[repositoryIndex])

  repositories[repositoryIndex].likes++

  response.status(201).send(repositories[repositoryIndex])
})

module.exports = app
