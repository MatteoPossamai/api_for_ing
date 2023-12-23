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
    const wallet = {
      "name": "TestWallet",
      "description": "TestWallet for Testings",
      "money": 100,
      "color": "#000000",
      "user": "test@test.com"
    }
    token = generateToken(process.env.JWT_SECRET || 'secret', 232000, {email: 'test@test.com', id : 'test'});
    await request(app).post("/api/wallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(wallet);
  })

afterAll(async () => {
    await request(app).delete("/api/wallet/test@test.com/TestWallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    await request(app).delete("/api/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    mongoose.connection.close();
    server.close();
})


describe("Test API GET /api/wallet", () => {
    // Put the token in the headers
    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/wallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/wallet").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });
});

describe("Test API GET /api/wallet/user/:name", () => {
    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/wallet/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body[0].name).toBe("TestWallet");
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/wallet/user/test@test.com").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).get("/api/wallet/user/test@nonuser.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.length).toBe(0);
    });
});

describe("Test API GET /api/wallet/:user/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/wallet/test@test.com/TestWallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.name).toBe("TestWallet");
        expect(response.body.user).toBe("test@test.com");
        expect(response.body.money).toBe(100);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/wallet/test@test.com/TestWallet").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).get("/api/wallet/test@user.com/TestWallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Wallet not found");
    });

    test("Chiamata all'API con wallet non esistente", async () => {
        const response = await request(app).get("/api/wallet/test@test.com/TestWallet0123").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Wallet not found");
    });

});

describe("Test API POST /api/wallet", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const wallet = {
            "name": "TestWallet2",
            "description": "TestWallet for Testings",
            "money": 100,
            "color": "#000000",
            "user": "test@test.com"
        }
        const response = await request(app).post("/api/wallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(wallet);
        expect(response.statusCode).toBe(201);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.name).toBe("TestWallet2");

        await request(app).delete("/api/wallet/test@test.com/TestWallet2").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    });

    test("Chiamata all'API senza token", async () => {
        const wallet = {
            "name": "TestWallet2",
            "description": "TestWallet for Testings",
            "money": 100,
            "color": "#000000",
            "user": "test@test.com"
        }
        const response = await request(app).post("/api/wallet").set("Content-Type", "application/json").send(wallet);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con wallet gia' esistente", async () => {
        const wallet = {
            "name": "TestWallet",
            "description": "TestWallet for Testings",
            "money": 100,
            "color": "#000000",
            "user": "test@test.com"
        };
        const response = await request(app).post("/api/wallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(wallet);
        expect(response.statusCode).toBe(409);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Wallet name already in use");
    });

    test("Chiamata all'API con wallet senza dati", async () => {
        const wallet = {
            "description": "TestWallet for Testings",
            "money": 100,
            "color": "#000000",
        }
        const response = await request(app).post("/api/wallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(wallet);
        expect(response.statusCode).toBe(400);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Bad Request");
    });

});

describe("Test API PUT /api/wallet/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const wallet = {
            "name": "TestWallet",
            "description": "TestWallet for Testings",
            "money": 200,
            "color": "#000000",
            "user": "test@test.com"
        }
        const response = await request(app).put("/api/wallet/TestWallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(wallet);
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Wallet updated");
        
        const response2 = await request(app).get("/api/wallet/test@test.com/TestWallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response2.statusCode).toBe(200);
        expect(response2.body).not.toBeNull();
        expect(response2.body).not.toBeUndefined();
        expect(response2.body.money).toBe(200);

    });

    test("Chiamata all'API senza token", async () => {
        const wallet = {
            "name": "TestWallet",
            "description": "TestWallet for Testings",
            "money": 200,
            "color": "#000000",
            "user": "test@test.com"
        }
        const response = await request(app).put("/api/wallet/TestWallet").set("Content-Type", "application/json").send(wallet);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con wallet non esistente", async () => {
        const wallet = {
            "name": "TestWallet2",
            "description": "TestWallet for Testings",
            "money": 200,
            "color": "#000000",
            "user": "test@test.com"
        }
        const response = await request(app).put("/api/wallet/TestWallet2").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(wallet);
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Wallet not found");
    });
});

describe("Test API DELETE /api/wallet/:user/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).delete("/api/wallet/test@test.com/TestWallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(204);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).delete("/api/wallet/test@test.com/TestWallet").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con wallet non esistente", async () => {
        const response = await request(app).delete("/api/wallet/test@test.com/TestWallet123").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Wallet not found");
    });

});