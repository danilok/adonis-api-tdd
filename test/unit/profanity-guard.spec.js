'use strict'

/** @type {import('@adonisjs/vow/src/Suite/index')} */
const { test, trait, before, after } = use('Test/Suite')('Profanity Guard')
/** @type {import('@adonisjs/fold/src/Ioc/index')} */
const { ioc } = use('@adonisjs/fold')
/** @type {typeof import('app/Services/ProfanityGuard')} */
const ProfanityGuard = use('App/Services/ProfanityGuard')

before(() => {
  ioc.fake('node-fetch', () => {
    return async (url) => ({
      text: async () => {
        const value = url.split('=')[1]
        return (value === 'jackass').toString()
      }
    })
  })
})

after(() => {
  ioc.restore('node-fetch')
})

test('can verify that passed value is a profanity', async ({ assert }) => {
  assert.plan(1)
  const profanityGuard = new ProfanityGuard()
  assert.isTrue(await profanityGuard.handle('jackass'))
})

test('can verify that passed value is not a profanity', async ({ assert }) => {
  assert.plan(1)
  const profanityGuard = new ProfanityGuard()
  assert.isFalse(await profanityGuard.handle('test'))
})
