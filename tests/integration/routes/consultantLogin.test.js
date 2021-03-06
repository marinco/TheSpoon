const request = require('supertest');

let server;
let app;

const http = require('http');
const db = require('../../../sequelizeSettings.js');
const config=require('config');

const bcrypt = require('bcrypt');
const Consultant = require('../../../models/consultant.js');

describe('/api/consultant/login', () => {

    //start the server before each test suite
    beforeEach( done => {
        app = require('../../../router.js');
        server = http.createServer(app);
        server.listen(done);
    });

    //close the server after each test suite, otherwise the port is still running
    afterEach( done => {
        server.close(done);
    });

    //close the db connection after all the tests
    afterAll (async done => {
        await db.close();
        done();
    });

    describe('POST /', () => {

        //it should return a 201 because the data sent are related to a valid consultant
        it('should return a 201', async (done) => {

            //first of all, create the consultant in the database
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash("123456", salt);

            await Consultant.create({
                Username: "xXEmilioXx_consultantLogin",
                Name: "Emilio",
                Surname: "Imperiali",
                Email: "consultant@mail.com",
                CompanySecret: config.get('companySecret'),
                Password: hashed
            });

            //then check if the login works by checking if the response has code 201
            const exec = async () => {
                return await request(app)
                    .post('/api/consultant/login')
                    .send({username: "xXEmilioXx_consultantLogin", password: "123456"})
            };

            const res = await exec();

            //remove the previously created consultant from the database
            await Consultant.destroy({
                where: {
                    Username: "xXEmilioXx_consultantLogin"
                }
            });

            expect(res.status).toBe(201);
            done();
        });

        it('should return a 400', async (done) => {

            const exec = async () => {
                return await request(app)
                    .post('/api/consultant/login')
                    .send({username: "xXEmilioXx_consultantLogin", password: "123456"})
            };

            const res= await exec();

            expect(res.status).toBe(400);
            done();
        });


    })

});