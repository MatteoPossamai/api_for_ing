const request = require('supertest');
import app from "../index";
import {server} from "../index";
import { default as mongoose } from 'mongoose';
import {describe, expect, test} from '@jest/globals';
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

describe("Test API POST /auth/signup", () => {

    test("Chiamata all'API password debole", async () => {
        const user = {
            "email": "testUser@newtest.com", 
            "password": "ciao",
            "firstName": "Test",
            "lastName": "Test"
        }
        const response = await request(app).post("/auth/signup").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(user);
        expect(response.statusCode).toBe(400);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();

        await request(app).delete("/auth/user/testUser@newtest.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    });

    test("Chiamata all'API con user gia' esistente", async () => {
        const user = {
            "email": "test@test.com", 
            "password": "PasswordStrong123!!",
            "firstName": "Test",
            "lastName": "Test"
        }
        const response = await request(app).post("/auth/signup").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(user);
        expect(response.statusCode).toBe(409);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("User already exists");
    });

});

describe("Test API POST /auth/login", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const user = {
            "email": "test@test.com", 
            "password": "PasswordStrong123!!",
        }
        const response = await request(app).post("/auth/login").set("Content-Type", "application/json").send(user);
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.token).not.toBeNull();
        expect(response.body.token).not.toBeUndefined();
    });

    test("Chiamata all'API con user non esistente", async () => {
        const user = {
            "email": "unknown@test.com", 
            "password": "PasswordStrong123!!",
        }

        const response = await request(app).post("/auth/login").set("Content-Type", "application/json").send(user);
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("User not found");
    });

    test("Chiamata all'API con password errata", async () => {
        const user = {
            "email": "test@test.com",
            "password": "PasswordStrong123asdfa"
        }
        const response = await request(app).post("/auth/login").set("Content-Type", "application/json").send(user);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Incorrect credentials");
    });

});

describe("Test API POST /auth/isLogged", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const user = {
            "email": "test@test.com", 
            "password": "PasswordStrong123!!",
        }
        const response = await request(app).post("/auth/isLogged").set("Content-Type", "application/json").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(user).send(user);
        expect(response.statusCode).toBe(200);
    });

    test("Chiamata all'API da non loggati ", async () => {
        const user = {
            "email": "test@test.com",
            "password": "PasswordStrong123asdfa"
        }
        const response = await request(app).post("/auth/isLogged").set("Content-Type", "application/json").send(user);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("No token provided");
    });

    test("Chiamata all'API da non token non valido ", async () => {
        const user = {
            "email": "test@test.com",
            "password": "PasswordStrong123asdfa"
        }
        const response = await request(app).post("/auth/isLogged").set("Content-Type", "application/json").set("x-access-token", "invalid").set("Content-Type", "application/json").set("Authorization", "invalid").send(user).send(user);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Invalid token");
    });

});

describe("Test API POST /auth/logout", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const user = {
            "email": "test@test.com", 
            "password": "PasswordStrong123!!",
        }
        const response = await request(app).post("/auth/logout").set("Content-Type", "application/json").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(user).send(user);
        expect(response.statusCode).toBe(200);
    });

    test("Chiamata all'API senza token", async () => {
        const user = {
            "email": "test@test.com",
            "password": "PasswordStrong123asdfa"
        }
        const response = await request(app).post("/auth/logout").set("Content-Type", "application/json").send(user);
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("You already logged out!");
    });

});