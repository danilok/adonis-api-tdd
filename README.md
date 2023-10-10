# Adonis API application

This is the boilerplate for creating an API server in AdonisJs, it comes pre-configured with.

1. Bodyparser
2. Authentication
3. CORS
4. Lucid ORM
5. Migrations and seeds

## Setup

Use the adonis command to install the blueprint

```bash
adonis new yardstick --api-only
```

or manually clone the repo and then run `npm install`.


### Migrations

Run the following command to run startup migrations.

```js
adonis migration:run
```

# References:
- https://equimper.com/blog/build-a-rest-api-with-adonisjs-and-tdd-part-1
- https://www.mikealche.com/software-development/how-to-set-up-a-testing-for-adonisjs-apps
- https://michaelzanggl.com/articles/tdd-with-adonisjs-1/