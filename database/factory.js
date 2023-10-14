'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

Factory.blueprint('App/Models/User', (faker, index, data) => {
  return {
    username: faker.username(),
    email: faker.email(),
    password: 'password123',
    ...data
  }
})

Factory.blueprint('App/Models/Challenge', faker => {
  return {
    title: faker.sentence(),
    description: faker.sentence(),
  }
})

Factory.blueprint('App/Models/Movie', (faker, index, data) => {
  return {
    title: faker.sentence(),
    ...data,
  }
})

Factory.blueprint('App/Models/Thread', async (faker) => {
  return {
    title: faker.word(),
    body: faker.paragraph(),
    user_id: (await Factory.model('App/Models/User').create()).id,
  }
})