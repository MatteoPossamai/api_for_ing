const request = require('supertest');
import app from "../index";
import {server} from "../index";
import { default as mongoose } from 'mongoose';
import {describe, expect, test} from '@jest/globals';
require("dotenv").config();
import { generateToken } from "../utils/token";

let token = "";
let id = "";

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
    const wallet = {
        "name": "TestWallet",
        "description": "TestWallet for Testings",
        "money": 100,
        "color": "#000000",
        "user": "test@test.com"
      }
    await request(app).post("/api/wallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(wallet);
    const category = {
        "name": "TestCategory",
        "tags": [],
        "color": "#000000",
        "user": "test@test.com"
    }
    await request(app).post("/api/category").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(category);
    const transaction = {
      "category": "TestCategory",
      "wallet": "TestWallet",
      "type": "expense",
      "money": 20,
      "description": "TestDescription",
      "user": "test@test.com"
    }
    let t = await request(app).post("/api/transaction").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(transaction);
    id = t.body._id;
  })

afterAll(async () => {
    await request(app).delete(`/api/transaction/${id}`).set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    await request(app).delete("/api/category/test@test.com/TestCategory").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    await request(app).delete("/api/wallet/test@test.com/TestWallet").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    await request(app).delete("/api/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    mongoose.connection.close();
    server.close();
})

describe("Test API GET /api/transaction", () => {
    // Put the token in the headers
    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/transaction").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/transaction").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });
});

describe("Test API GET /api/transaction/user/:name", () => {
    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/transaction/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body[0].wallet).toBe("TestWallet");
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/transaction/user/test@test.com").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).get("/api/transaction/user/test@nonuser.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.length).toBe(0);
    });
});

describe("Test API GET /api/transaction/:id", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get(`/api/transaction/${id}`).set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.wallet).toBe("TestWallet");
        expect(response.body.user).toBe("test@test.com");
        expect(response.body.money).toBe(20);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get(`/api/transaction/${id}`).set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con transaction non esistente", async () => {
        const response = await request(app).get("/api/transaction/TransactionNotHere").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Transaction not found");
    });

});

describe("Test API POST /api/transaction", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const transaction = {
            "category": "TestCategory",
            "wallet": "TestWallet",
            "type": "expense",
            "money": 30,
            "description": "TestDescription",
            "user": "test@test.com"
          }
        const response = await request(app).post("/api/transaction").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(transaction);
        expect(response.statusCode).toBe(201);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.wallet).toBe("TestWallet");
        let id2 = response.body._id;

        await request(app).delete(`/api/transaction/${id2}`).set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    });

    test("Chiamata all'API senza token", async () => {
        const transaction = {
            "category": "TestCategory",
            "wallet": "TestWallet",
            "type": "expense",
            "money": 20,
            "description": "TestDescription",
            "user": "test@test.com"
          }
        const response = await request(app).post("/api/transaction").set("Content-Type", "application/json").send(transaction);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con transaction senza wallet", async () => {
        const transaction = {
            "money": 25,
            "description": "TestDescription",
            "user": "test@test.com"
          }
        const response = await request(app).post("/api/transaction").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(transaction);
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Wallet not found");
    });

    test("Chiamata all'API con transaction senza dati", async () => {
        const transaction = {
            "category": "TestCategory",
            "wallet": "TestWallet",
            "type": "expense",
            "user": "test@test.com"
          }
        const response = await request(app).post("/api/transaction").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(transaction);
        expect(response.statusCode).toBe(400);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Bad Request");
    });

});

describe("Test API PUT /api/transaction/:id", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const transaction = {
            "category": "TestCategory",
            "wallet": "TestWallet",
            "type": "expense",
            "money": 15,
            "description": "TestDescription",
            "user": "test@test.com",
            "_id": id
          }
        const response = await request(app).put(`/api/transaction`).set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(transaction);
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Transaction updated");
        
        const response2 = await request(app).get(`/api/transaction/${id}`).set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response2.statusCode).toBe(200);
        expect(response2.body).not.toBeNull();
        expect(response2.body).not.toBeUndefined();
        expect(response2.body.money).toBe(15);

    });

    test("Chiamata all'API senza token", async () => {
        const transaction = {
            "category": "TestCategory",
            "wallet": "TestWallet",
            "type": "expense",
            "money": 20,
            "description": "TestDescription",
            "user": "test@test.com"
          }
        const response = await request(app).put("/api/transaction/test").set("Content-Type", "application/json").send(transaction);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con wallet non esistente", async () => {
        const transaction = {
            "category": "TestCategory",
            "wallet": "here not",
            "type": "expense",
            "money": 20,
            "description": "TestDescription",
            "user": "test@test.com",
            "id": id
          }
        const response = await request(app).put("/api/transaction").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(transaction);
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Transaction not found");
    });
});

describe("Test API DELETE /api/transaction/:id", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).delete(`/api/transaction/${id}`).set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(204);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).delete("/api/transaction/idrandom").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con transaction che non esistente", async () => {
        const response = await request(app).delete("/api/transaction/nonhere").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Transaction not found");
    });

});