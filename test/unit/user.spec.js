'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const { test, trait } = use('Test/Suite')('User')

trait('DatabaseTransactions')

test('can check if user is moderator', async ({ assert }) => {
  const user = await Factory.model('App/Models/User').make({ type: 1 })
  assert.isTrue(user.isModerator())
})

test('can check if user is not a moderator', async ({ assert }) => {
  const user = await Factory.model('App/Models/User').make()
  assert.isFalse(user.isModerator())
})
