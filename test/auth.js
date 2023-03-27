const { expect } = require('chai')
const { userDataValidation } = require("../utils/auth")

describe("user data validation", () => {
  it("should return 'invalid name'", done => {
    const username = "abcde123456"
    const email = "test@test.com"
    const password = "12345678"
    expect(userDataValidation(username, email, password)).equal("invalid name")
    done()
  })

  it("should return 'invalid email'", done => {
    const username = "Sparkles"
    const email = "test@com"
    const password = "12345678"
    expect(userDataValidation(username, email, password)).equal("invalid email")
    done()
  })

  it("should return 'invalid password'", done => {
    const username = "Sparkles"
    const email = "test@test.com"
    const password = "12345"
    expect(userDataValidation(username, email, password)).equal("invalid password")
    done()
  })

  it("should return 'valid'", done => {
    const username = "Sparkles"
    const email = "test@test.com"
    const password = "12345678"
    expect(userDataValidation(username, email, password)).equal("valid")
    done()
  })


  it("should return 'invalid email'", done => {
    const username = ""
    const email = "test@com"
    const password = "12345678"
    expect(userDataValidation(username, email, password)).equal("invalid email")
    done()
  })

  it("should return 'invalid password'", done => {
    const username = ""
    const email = "test@test.com"
    const password = "12345"
    expect(userDataValidation(username, email, password)).equal("invalid password")
    done()
  })

})