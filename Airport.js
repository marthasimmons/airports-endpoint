/**
 * @swagger
 *   components:
 *     schemas:
 *       Airport:
 *         type: object
 *         properties:
 *           icao:
 *             type: string
 *           iata:
 *             type: string
 *           name:
 *             type: string
 *           city:
 *             type: string
 *           state:
 *             type: string
 *           country:
 *             type: string
 *           elevation:
 *             type: integer
 *           lat:
 *             type: float
 *           lon:
 *             type: float
 *           tz:
 *             type: string
 *         example:
 *           icao: "00AK"
 *           iata: ""
 *           name: "Lowell Field"
 *           city: "Anchor Point"
 *           state: "Alaska"
 *           country: "US"
 *           elevation: 450
 *           lat: 59.94919968
 *           lon: -151.695999146
 *           tz: "America/Anchorage"
 */
module.exports = class Airport {
    icao = ""
    iata = ""
    name = ""
    city = ""
    state = ""
    country = ""
    elevation = 0
    lat = 0.0
    lon = -0.0
    tz = ""

    constructor (data) {
        Object.assign(this, data)
    }
}