import { describe, it, expect } from 'vitest'

describe('App scaffold', () => {
  it('exports router', async () => {
    const { router } = await import('./router')
    expect(router).toBeDefined()
  })
})
