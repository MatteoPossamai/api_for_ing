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
    const category = {
        "name": "TestCategory",
        "tags": [],
        "color": "#000000",
        "user": "test@test.com"
    }
    token = generateToken(process.env.JWT_SECRET || 'secret', 232000, {email: 'test@test.com', id : 'test'});
    await request(app).post("/api/category").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(category);
  })

afterAll(async () => {
    await request(app).delete("/api/category/test@test.com/TestCategory").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    await request(app).delete("/api/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    mongoose.connection.close();
    server.close();
})

describe("Test API GET /api/category", () => {
    // Put the token in the headers
    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/category").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/category").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });
});

describe("Test API GET /api/category/user/:name", () => {
    // Put the token in the headers
    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/category/user/test@test.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body[0].name).toBe("TestCategory");
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/category/user/test@test.com").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).get("/api/category/user/test@nonuser.com").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.length).toBe(0);
    });
});

describe("Test API GET /api/category/:user/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).get("/api/category/test@test.com/TestCategory").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.name).toBe("TestCategory");
        expect(response.body.user).toBe("test@test.com");
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).get("/api/category/test@test.com/TestCategory").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con user non esistente", async () => {
        const response = await request(app).get("/api/category/test@user.com/TestCategory").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Category not found");
    });

    test("Chiamata all'API con category non esistente", async () => {
        const response = await request(app).get("/api/category/test@test.com/TestCategory0123").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Category not found");
    });

});

describe("Test API POST /api/category", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const category = {
            "name": "TestCategory2",
            "tags": ["test1", "test2"],
            "color": "#ffffff",
            "user": "test@test.com"
        }
        const response = await request(app).post("/api/category").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(category);
        expect(response.statusCode).toBe(201);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.name).toBe("TestCategory2");

        await request(app).delete("/api/category/test@test.com/TestCategory2").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
    });

    test("Chiamata all'API senza token", async () => {
        const category = {
            "name": "TestCategory2",
            "description": "TestCategory for Testings",
            "money": 100,
            "color": "#000000",
            "user": "test@test.com"
        }
        const response = await request(app).post("/api/category").set("Content-Type", "application/json").send(category);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });


    test("Chiamata all'API con category gia' esistente", async () => {
        const category = {
            "name": "TestCategory",
            "tags": [],
            "color": "#000000",
            "user": "test@test.com"
        }
        const response = await request(app).post("/api/category").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(category);
        expect(response.statusCode).toBe(409);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Category name already in use");
    });

    test("Chiamata all'API con category senza dati", async () => {
        const category = {
            "tags": [],
            "color": "#000000",
        }
        const response = await request(app).post("/api/category").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(category);
        expect(response.statusCode).toBe(400);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Bad Request");
    });

});

describe("Test API PUT /api/category/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const category = {
            "name": "TestCategory",
            "tags": ["new"],
            "user": "test@test.com"
        }
        const response = await request(app).put("/api/category/TestCategory").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(category);
        expect(response.statusCode).toBe(200);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Category updated");
        
        const response2 = await request(app).get("/api/category/test@test.com/TestCategory").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response2.statusCode).toBe(200);
        expect(response2.body).not.toBeNull();
        expect(response2.body).not.toBeUndefined();
        expect(response2.body.tags.length).toBe(1);

    });

    test("Chiamata all'API senza token", async () => {
        const category = {
            "name": "TestCategory",
            "tags": [],
            "color": "#00020",
            "user": "test@test.com"
        }
        const response = await request(app).put("/api/category/TestCategory").set("Content-Type", "application/json").send(category);
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con category non esistente", async () => {
        const category = {
            "name": "TestCategory",
            "tags": [],
            "color": "#000000",
            "user": "test@test.com"
        }
        const response = await request(app).put("/api/category/TestCategory2").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send(category);
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Category not found");
    });
});

describe("Test API DELETE /api/category/:user/:name", () => {

    test("Chiamata all'API in maniera corretta", async () => {
        const response = await request(app).delete("/api/category/test@test.com/TestCategory").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(204);
    });

    test("Chiamata all'API senza token", async () => {
        const response = await request(app).delete("/api/category/test@test.com/TestCategory").set("Content-Type", "application/json").send();
        expect(response.statusCode).toBe(401);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.body.message).toBe("Nessun token fornito");
    });

    test("Chiamata all'API con category non esistente", async () => {
        const response = await request(app).delete("/api/category/test@test.com/TestCategory123").set("x-access-token", token).set("Content-Type", "application/json").set("Authorization", token).send();
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toBeNull();
        expect(response.body).not.toBeUndefined();
        expect(response.text).toBe("Category not found");
    });

});