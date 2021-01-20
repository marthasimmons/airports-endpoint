const app = require("../server")
const request = require('supertest')
const path = "/airports"

describe("Airport server", () => {
    test("Can get a page of airports", async (done) => {
        request(app)
           .get(path + "?page=1&pageSize=5")
           .expect(200)
           .expect(res => {
               expect(res.body.length).toBe(5)
           })
           .end(done)
    })
    
    test("Can't request page out of range", async (done) => {
        request(app)
            .get(path + "?page=0&pageSize=5")
            .expect(400)
            .expect(res => {
                expect(res.text).toBe("invalid search params")
            })
            .end(done)
    })

    test("Can create a new airport", async (done) => {
        let json = {
            "icao" : "MLS",
            "name" : "Martha's airport",
            "city" : "Birkenhead"
        }

        request(app)
            .post(path)
            .send(json)
            .expect(201)
            .expect(res => {
                expect(res.body.icao).toBe(json.icao)
                expect(res.body.name).toBe(json.name)
                expect(res.body.city).toBe(json.city)
            })
            .end(done)
    })

    test("Can't create 2 airports with same icao", async (done) => {
        let json = {
            "icao" : "YJUK",
            "name" : "Martha's airport",
            "city" : "Birkenhead"
        }

        request(app)
            .post(path)
            .send(json)
            .expect(400)
            .expect(res => {
                expect(res.text).toBe("airport must have unique icao")
            })
            .end(done)
    })

    test("Can't create airport without required data", async (done) => {
        let json = {
            "name" : "Martha's airport",
            "city" : "Birkenhead"
        }

        request(app)
            .post(path)
            .send(json)
            .expect(400)
            .expect(res => {
                expect(res.text).toBe("airport must have icao, name and city")
            })
            .end(done)
    })

    test("Can get a specific airport", async (done) => {
        let json = {
            "icao":"YJUK",
            "iata":"",
            "name":"Tjukurla Airport",
            "city":"",
            "state":"Western-Australia",
            "country":"AU",
            "elevation":0
            ,"lat":-24.3707103729,
            "lon":128.7393341064,
            "tz":"Australia/Perth"
        }

        request(app)
            .get(path + "/YJUK")
            .expect(200)
            .expect(res => {
                expect(res.body).toEqual(json)
            })
            .end(done)
    })

    test("Can't get airport with invalid icao", async (done) => {
        request(app)
            .get(path + "/100GEC")
            .expect(400)
            .expect(res => {
                expect(res.text).toBe("invalid icao")
            })
            .end(done)
    })

    test("Can update an airport", async (done) => {
        let json = {
            "name" : "Happy Fun Airport"
        }
        
        request(app)
            .patch(path + "/YJUK")
            .send(json)
            .expect(202)
            .expect(res => {
                expect(res.body.name).toBe("Happy Fun Airport")
            })
            .end(done)
    })

    test("Can't update airport to have same icao as another", async (done) => {
        let json = {
            "icao" : "YJDA"
        }

        request(app)
            .patch(path + "/YJUK")
            .send(json)
            .expect(400)
            .expect(res => {
                expect(res.text).toBe("airport must have unique icao")
            })
            .end(done)
    })

    test("Can delete airport", async (done) => {
        request(app)
            .delete(path + "/YJUK")
            .expect(202)
            .expect(res => {
                expect(res.text).toBe("airport has been deleted")
            })
            .then(function() {
                request(app)
                    .get(path + "/YJUK")
                    .expect(400)
                    .expect(res => {
                        expect(res.text).toBe("invalid icao")
                    })
                    .end(done)
            })
    })

    test("Can't delete airport with invalid icao", async (done) => {
        request(app)
            .delete(path + "/:)") 
            .expect(400)
            .expect(res => {
                expect(res.text).toBe("invalid icao")
            })
            .end(done)
    })
})