# Adonis 4 TDD 

This is a study for TDD using AdonisJS 4

## Setup

Install dependencies with: `npm install`.


### Migrations

Run the following command to run startup migrations.

```js
npx adonis migration:run
```

# References:
- https://equimper.com/blog/build-a-rest-api-with-adonisjs-and-tdd-part-1
- https://www.mikealche.com/software-development/how-to-set-up-a-testing-for-adonisjs-apps
- https://michaelzanggl.com/articles/tdd-with-adonisjs-1/

# Run tests

Run all tests: `npm run test`

## E2E Tests
- Normal mode: `npm run e2e-test`
- Watch mode: `npm run e2e-watch`

## Unit Tests
- Normal mode: `npm run unit-test`
- Watch mode: `npm run unit-watch`

## Code coverage
Run `npm run test:cov`

# Create tests with VSCode snippet
Type on editor `make:test`
