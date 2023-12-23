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
    const budget = {
      "name": "TestBudget",
      "description": "TestBudget for Testings",
      "initialMoney": 100,
      "actualMoney": 100,
      "category": "Test",
      "color": "#000000",
      "user": "test@test.com"
    }
    token = generateToken(process.env.JWT_SECRET || 'secret', 232000, {email: 'test@test.com', id : 'test'});
    await request(app).post("/api/budget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(budget);
  })

afterAll(async () => {
    await request(app).delete("/api/budget/test@test.com/TestBudget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    await request(app).delete("/api/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    mongoose.connection.close();
    server.close();
})

describe("Test API GET /api/budget", () => {
    // Put the token in the headers
    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/budget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/budget").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con token invalido", async () => {
        const response = await request(app).get("/api/budget").set("x-access-token", "inalid").set("Content-Type", "application/json").set("Authorization", "invalid").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Token non valido");
    });
});

describe("Test API GET /api/budget/user/:name", () => {
    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/budget/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body[0].name).toBe("TestBudget");
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/budget/user/test@test.com").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).get("/api/budget/user/test@nonuser.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.length).toBe(0);
    });
});

describe("Test API GET /api/budget/:user/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/budget/test@test.com/TestBudget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.name).toBe("TestBudget");
        expect(response.body.user).toBe("test@test.com");
        expect(response.body.initialMoney).toBe(100);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/budget/test@test.com/TestBudget").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).get("/api/budget/test@user.com/TestBudget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Budget not found");
    });

    test("Chiamata all'API con budget non esistente", async () => {
        const response = await request(app).get("/api/budget/test@test.com/TestBudget0123").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Budget not found");
    });

});

describe("Test API POST /api/budget", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const budget = {
            "name": "TestBudget2",
            "description": "TestBudget for Testings",
            "initialMoney": 100,
            "actualMoney": 100,
            "category": "Test",
            "color": "#000000",
            "user": "test@test.com"
          }
        const response = await request(app).post("/api/budget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(budget);
        expect(response.statusCode).toBe(201);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.name).toBe("TestBudget2");

        await request(app).delete("/api/budget/test@test.com/TestBudget2").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    });

    test("Chiamata all'API senza token", async () => {
        const budget = {
            "name": "TestBudget2",
            "description": "TestBudget for Testings",
            "initialMoney": 100,
            "actualMoney": 100,
            "category": "Test",
            "color": "#000000",
            "user": "test@test.com"
          }
        const response = await request(app).post("/api/budget").set("Content-Type", "application/json").send(budget);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con budget gia' esistente", async () => {
        const budget = {
            "name": "TestBudget",
            "description": "TestBudget for Testings",
            "initialMoney": 100,
            "actualMoney": 100,
            "category": "Test",
            "color": "#000000",
            "user": "test@test.com"
          }
        const response = await request(app).post("/api/budget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(budget);
        expect(response.statusCode).toBe(409);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Budget name already in use");
    });

    test("Chiamata all'API con budget senza dati", async () => {
        const budget = {
            "initialMoney": 100,
            "actualMoney": 100,
            "category": "Test",
          }
        const response = await request(app).post("/api/budget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(budget);
        expect(response.statusCode).toBe(400);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Bad Request");
    });

});

describe("Test API PUT /api/budget/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const budget = {
            "name": "TestBudget",
            "description": "TestBudget for Testings",
            "initialMoney": 100,
            "actualMoney": 50,
            "category": "Test",
            "color": "#000000",
            "user": "test@test.com"
          }
        const response = await request(app).put("/api/budget/TestBudget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(budget);
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Budget updated");
        
        const response2 = await request(app).get("/api/budget/test@test.com/TestBudget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response2.statusCode).toBe(200);
        expect(response2.body).not.toBeNull();
        expect(response2.body).not.toBeUndefined();
        expect(response2.body.actualMoney).toBe(50);

    });

    test("Chiamata all'API senza token", async () => {
        const budget = {
            "name": "TestBudget",
            "description": "TestBudget for Testings",
            "initialMoney": 100,
            "actualMoney": 100,
            "category": "Test",
            "color": "#000000",
            "user": "test@test.com"
          }
        const response = await request(app).put("/api/budget/TestBudget").set("Content-Type", "application/json").send(budget);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con budget non esistente", async () => {
        const response = await request(app).put("/api/budget/TestBudget2").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send({});
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Budget not found");
    });
});

describe("Test API DELETE /api/budget/:user/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).delete("/api/budget/test@test.com/TestBudget").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(204);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).delete("/api/budget/test@test.com/TestBudget").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con budget non esistente", async () => {
        const response = await request(app).delete("/api/budget/test@test.com/TestBudget123").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Budget not found");
    });

});