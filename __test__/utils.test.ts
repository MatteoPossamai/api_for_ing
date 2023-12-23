const request = require('supertest');
import app from "../index";
import {server} from "../index";
import { default as mongoose } from 'mongoose';
import {describe, expect, test} from '@jest/globals';
require("dotenv").config();
import { passwordChecker } from "../utils/passwordChecker";
import { generateToken, verifyToken } from "../utils/token";

// For documentation references and tutorials
// https://dev.to/nathan_sheryak/how-to-test-a-typescript-express-api-with-jest-for-dummies-like-me-4epd

beforeAll(done => {
    jest.setTimeout(20000);
    done();
  })

afterAll(done => {
    mongoose.connection.close();
    server.close();
    done();
})


describe("Chiamata Endpoint health", () => {
    test("Chiama endpoint di controllo che il server stia funzionando", async () => {
      const res = await request(app).get("/health");
      expect(res.text).toEqual("Healthy");
    });
});

describe("Controllo della validita' e robustezza della password", () => {

  test("Password sufficientemente robusta", () => {
    const password = "PasswordThat!1Strong!!";
    const result = passwordChecker(password);
    expect(result).toBe(true);
  });

  test("Password troppo corta (meno  8 caratteri)", () => {
    const password = "Passw1";
    const result = passwordChecker(password);
    expect(result).toBe(false);
  });

  test("Password senza numeri", () => {
    const password = "PasswordStrong!!";
    const result = passwordChecker(password);
    expect(result).toBe(false);
  });

  test("Password senza caratteri speciali", () => {
    const password = "PasswordStrong11";
    const result = passwordChecker(password);
    expect(result).toBe(false);
  });

  test("Password senza lettere maiuscole", () => {
    const password = "passwordstrong!!";
    const result = passwordChecker(password);
    expect(result).toBe(false);
  });

  test("Password senza lettere minuscole", () => {
    const password = "PASSWORDSTRONG!!";
    const result = passwordChecker(password);
    expect(result).toBe(false);
  });

});


describe("Controllo funzionalita' creazione token", () => {

  test("Creazione token corretta", () => {
    const token = generateToken("secret", 1000, {"email": "test@test.com"});
    expect(token).not.toBeNull();
    expect(token).not.toBeUndefined();
    expect(token.length).toBeGreaterThan(0);
  });

});


describe("Controllo funzionalita' di verifica del token, ed eventuale decodifica", () => {

  let valid_token = generateToken("secret", 1000, {"email": "test@test.com"});
  let invalid_token = "invalid_token";

  test("Verifica token corretto", async () => {
    const result = await verifyToken("secret", valid_token);
    expect(result).not.toBe(false);
    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    expect(result.email).toBe("test@test.com");
  });

  test("Verifica token non valido", async () => {
    const result = await verifyToken("secret", invalid_token);
    expect(result).toBe(undefined);
  });

  test("Verifica token con secret vuoto", async () => {
    const result = await verifyToken("", valid_token);
    expect(result).toBe(undefined);
  });

});