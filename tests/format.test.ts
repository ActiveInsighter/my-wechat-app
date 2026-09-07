import { describe, expect, it } from 'vitest'
import { formatCount, getGreeting } from '../src/utils/format'

describe('formatCount', () => {
  it('keeps small counts readable', () => {
    expect(formatCount(8)).toBe('8')
  })

  it('condenses large counts with a Chinese unit', () => {
    expect(formatCount(12800)).toBe('1.3 万')
  })
})

describe('getGreeting', () => {
  it('returns a calm morning greeting before noon', () => {
    expect(getGreeting(9)).toBe('早上好')
  })

  it('returns an evening greeting after 18:00', () => {
    expect(getGreeting(19)).toBe('晚上好')
  })
})
