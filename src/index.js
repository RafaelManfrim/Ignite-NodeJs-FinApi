const express = require('express')
const { v4: uuidV4 } = require('uuid')

const app = express()
app.use(express.json())

const customers = []

app.post("/account", (req, res) => {
    const { cpf, name } = req.body
    const customerAlreadyExists = customers.some(customer => customer.cpf === cpf)
    if(customerAlreadyExists) {
        return res.status(400).json({ error: 'Customer already exists!' })
    }
    customers.push({ id: uuidV4(), name, cpf, statement: [] })
    return res.status(201).send()
})

app.get("/statement/", (req, res) => {
    const { cpf } = req.headers
    const customer = customers.find(customer => customer.cpf === cpf)
    if(!customer) {
        return res.status(400).json({ error: 'Customer not found!' })
    }
    return res.json(customer.statement)
})

app.listen(3333)