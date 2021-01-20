const express = require('express')
const app = express()
const swaggerUi = require('swagger-ui-express')
const airports = require('./airports.json')
const Airport = require('./Airport')
const YAML = require('js-yaml')
const fs = require('fs')
const docs = YAML.load(fs.readFileSync('./airports-config.yaml').toString())
const swaggerDocs = require('swagger-jsdoc')({
    swaggerDefinition: docs,
    apis: ['./server.js', './Airport.js']
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {explorer: true}))
app.use(express.json())

/**
 * @swagger
 * /airports:
 *   get:
 *     summary: returns an array of airports
 *     responses:
 *       200:
 *         description: all the airports requested
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Airport'                 
 */
app.get('/airports', (req, res) => {
    var pageSize = req.query.pageSize
    var page = req.query.page

    if (pageSize == undefined) {
        pageSize = 10
    }

    if (page == undefined) {
        page = 1
    }
    
    var min = (page - 1) * pageSize
    var max = page * pageSize

    if (max > airports.length || min < 0) {
        res.status(400).send("invalid search params")
    } else {
       res.status(200).send(airports.slice(min,max)) 
    }
})

/**
 * @swagger
 * /airports:
 *   post: 
 *     summary: Creates a new airport
 *     requestBody:
 *       required: true 
 *       content: 
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Airport'
 *     responses:
 *        201:
 *          description: JSON object representing the new airport
 *          content:
 *            application/json:
 *              schema: 
 *                $ref: '#/components/schemas/Airport'            
 */
app.post('/airports', (req, res) => {
    let airport = new Airport(req.body)

    if (airport.icao == "" || airport.name == "" || airport.city == "") {
        res.status(400).send("airport must have icao, name and city")
    } else if (getAirportIndex(airport.icao) != undefined) {
        res.status(400).send("airport must have unique icao")
    } else {
        airports.push(airport)
        res.status(201).send(airport)
    }
})

/**
 * @swagger
 * /airports/{icao}:
 *   get:
 *     summary: Returns one airport
 *     parameters:
 *       - in: path
 *         name: icao
 *         schema:
 *           type: string
 *         required: true
 *         description: String used to identify airport
 *     responses:
 *       200:
 *         description: airport requested
 *         content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Airport'
 */
app.get('/airports/:icao', (req, res) => {
    let index = getAirportIndex(req.params.icao)
    
    if (index == undefined) {
        res.status(400).send("invalid icao")
    } else {
        res.status(200).send(airports[index])
    }
})

/**
 * @swagger
 * /airports/{icao}:
 *   patch:
 *     summary: Updates an airport
 *     parameters:
 *       - in: path
 *         name: icao
 *         schema:
 *           type: string
 *         required: true
 *         description: String used to identify airport
 *     requestBody:
 *       required: true 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Airport' 
 *     responses:
 *       202:
 *         description: JSON object representing updated airport
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Airport'   
 */
app.patch('/airports/:icao', (req, res) => {
    let index = getAirportIndex(req.params.icao)
    let airport = airports[index]
    let changes = req.body

    if (changes.hasOwnProperty('icao') && getAirportIndex(changes.icao) != undefined) {
        res.status(400).send("airport must have unique icao")
    } else {
        for (var x in changes) {
            if (airport.hasOwnProperty(x)) {
                airport[x] = changes[x]
            }
        }

        airports[index] = airport
        res.status(202).send(airport)
    }
})

/**
 * @swagger
 * /airports/{icao}:
 *   delete: 
 *     summary: Deletes an airport
 *     parameters:
 *       - in: path
 *         name: icao
 *         schema:
 *           type: string
 *         required: true
 *         description: String used to identify airport
 *     responses:
 *       202:
 *         description: Airport has been deleted 
 */
app.delete('/airports/:icao', (req, res) => {
    let index = getAirportIndex(req.params.icao)

    if (index == undefined) {
        res.status(400).send("invalid icao")
    } else {
        airports.splice(index, 1)
        res.status(202).send("airport has been deleted")
    }
})

function getAirportIndex(icao) {
    var i 

    for (i = 0; i < airports.length; i ++) {
        if (airports[i]["icao"] == icao) {
            return i
        }
    }

   return undefined
}

module.exports = app