const request = require('supertest');
import app from "../index";
import {server} from "../index";
import { default as mongoose } from 'mongoose';
import {describe, expect, test} from '@jest/globals';
const jwt = require('jsonwebtoken');
require("dotenv").config();
import { generateToken } from "../utils/token";

let token = "";

beforeAll(async () => {
    jest.setTimeout(20000);
    const user = {
        "email": "test@test.com", 
        "password": "PasswordStrong123!!",
        "firstName": "Test",
        "lastName": "Test"
    }
    await request(app).post("/auth/signup").send(user);
    token = generateToken(process.env.JWT_SECRET || 'secret', 232000, {email: 'test@test.com', id : 'test'});
  })

afterAll(async () => {
    await request(app).delete("/api/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    mongoose.connection.close();
    server.close();
})

describe("Test API GET /api/user", () => {
    // Put the token in the headers
    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/user").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/user").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });
});


describe("Test API GET /api/user/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.firstName).toBe("Test");
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/user/test@test.com").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).get("/api/user/testare@user.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("User not found");
    });

});

describe("Test API PUT /api/user/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const user = {
            "email": "test@test.com", 
            "password": "PasswordStrong123!!",
            "firstName": "Test1",
            "lastName": "Test1"
        }
        const response = await request(app).put("/api/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(user);
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("User updated");
        
        const response2 = await request(app).get("/api/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response2.statusCode).toBe(200);
        expect(response2.body).not.toBeNull();
        expect(response2.body).not.toBeUndefined();
        expect(response2.body.firstName).toBe("Test1");

    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).put("/api/user/TestWallet").set("Content-Type", "application/json").send({});
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).put("/api/user/TestWallet2").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send({});
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("User not found");
    });
});

describe("Test API PUT /api/user/password/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const user = { 
            "password": "PasswordStrong123!!11",
        }
        const response = await request(app).put("/api/user/password/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(user);
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("User updated");
        
        const response2 = await request(app).get("/api/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response2.statusCode).toBe(200);
        expect(response2.body).not.toBeNull();
        expect(response2.body).not.toBeUndefined();
        expect(response2.body.password).toBe("PasswordStrong123!!11");

    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).put("/api/user/password/TestWallet").set("Content-Type", "application/json").send({});
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).put("/api/user/password/TestWallet2").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send({});
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("User not found");
    });
});

describe("Test API DELETE /api/user/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).delete("/api/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(204);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).delete("/api/user/test@test.com").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).delete("/api/user/test@test.comemai").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("User not found");
    });

});