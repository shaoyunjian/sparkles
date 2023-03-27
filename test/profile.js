const { expect } = require('chai')
const { profileEditValidation } = require("../utils/profile")

describe("profile edit validation", () => {
  it("should return 'invalid username'", done => {
    const username = "abcde123456"
    expect(profileEditValidation(username, "")).equal("invalid username")
    done()
  })

  it("should return 'valid username'", done => {
    const username = "Sparkles"
    expect(profileEditValidation(username, "")).equal("valid username")
    done()
  })

  it("should return 'invalid password'", done => {
    const password = "1234"
    expect(profileEditValidation("", password)).equal("invalid password")
    done()
  })

  it("should return 'valid password'", done => {
    const password = "12345678"
    expect(profileEditValidation("", password)).equal("valid password")
    done()
  })

})