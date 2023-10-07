'use strict'

const Factory = use('Factory')
/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait } = use('Test/Suite')('Create Challenge')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('can create a challenge if valid data', async ({ assert, client }) => {
  assert.plan(2)

  const user = await Factory.model('App/Models/User').create()
  
  const data = {
    title: 'Top 5 2018 Movies to watch',
    description: 'A list of 5 movies from 2018 to absolutely watched'
  }
  
  const response = await client
    .post('/api/challenges')
    .loginVia(user, 'jwt')
    .send(data)
    .end()

  // console.log('error', response.error)

  response.assertStatus(201)
  response.assertJSONSubset({
    title: 'Top 5 2018 Movies to watch',
    description: 'A list of 5 movies from 2018 to absolutely watched',
    user_id: user.id,
  })
})

test('cannot create a challenge if not authenticated', async({ assert, client}) => {
  assert.plan(1)

  const data = {
    title: 'Top 5 2018 Movies to watch',
    description: 'A list of 5 movies from 2018 to absolutely watched'
  }

  const response = await client
    .post('/api/challenges')
    .send(data)
    .end()

  // console.log('error', response.error.message)

  response.assertStatus(401)
})

test('cannot create a challeng if no title', async ({ assert, client }) => {
  assert.plan(2)

  // test do generate fake title and description
  // const { title, description } = await Factory.model('App/Models/Challenge').make()
  // console.log({ title, description });

  const user = await Factory.model('App/Models/User').create()
  const { description } = await Factory.model('App/Models/Challenge').make()

  const data = {
    description,
  }

  const response = await client
    .post('/api/challenges')
    .loginVia(user, 'jwt')
    .send(data)
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'title is required',
      field: 'title',
      validation: 'required'
    }
  ])
})

test('cannot create a challeng if title and description are not string', async ({
  assert,
  client
}) => {
  assert.plan(2)

  const user = await Factory.model('App/Models/User').create()

  const data = {
    title: 123,
    description: 456,
  }

  const response = await client
    .post('/api/challenges')
    .loginVia(user, 'jwt')
    .send(data)
    .end()

  response.assertStatus(400)
  response.assertJSONSubset([
    {
      message: 'title is not a valid string',
      field: 'title',
      validation: 'string'
    },
    {
      message: 'description is not a valid string',
      field: 'description',
      validation: 'string'
    }
  ])
})
