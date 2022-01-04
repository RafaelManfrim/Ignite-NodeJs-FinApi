const express = require('express')
const { v4: uuidV4 } = require('uuid')

const app = express()
app.use(express.json())

const customers = []

// Middleware
function verifyIfExistsAccountByCPF(req, res, next) {
    const { cpf } = req.headers
    const customer = customers.find(customer => customer.cpf === cpf)
    if(!customer) {
        return res.status(400).json({ error: 'Customer not found!' })
    }

    req.customer = customer

    return next()
}

function calculateAccountBalance(statement) {
    const reducer = (accum, curr) => (
        curr.type === 'deposit' ? accum + +curr.amount : accum - +curr.amount
    )
    const balance = statement.reduce(reducer, 0)
    return balance
}

app.post("/account", (req, res) => {
    const { cpf, name } = req.body
    const customerAlreadyExists = customers.some(customer => customer.cpf === cpf)
    if(customerAlreadyExists) {
        return res.status(400).json({ error: 'Customer already exists!' })
    }
    customers.push({ id: uuidV4(), name, cpf, statement: [] })
    return res.status(201).send()
})

app.get("/statement/", verifyIfExistsAccountByCPF, (req, res) => {
    const { customer } = req
    return res.json(customer.statement)
})

app.post("/deposit/", verifyIfExistsAccountByCPF, (req, res) => {
    const { description, amount } = req.body
    const { customer } = req

    const statementOperation = {
        description,
        amount,
        date: new Date(),
        type: "deposit"
    }

    customer.statement.push(statementOperation)

    return res.status(201).send()
})

app.post("/withdraw/", verifyIfExistsAccountByCPF, (req, res) => {
    const { description, amount } = req.body
    const { customer } = req
    const balance = calculateAccountBalance(customer.statement)
    if(balance < +amount){
        return res.status(400).json({ error: 'Do not have enough funds to withdraw' })
    }

    const statementOperation = {
        description,
        amount,
        date: new Date(),
        type: "withdraw"
    }

    customer.statement.push(statementOperation)

    return res.status(201).send()
})

app.listen(3333)