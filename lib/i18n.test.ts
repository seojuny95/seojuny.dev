import { describe, it, expect } from 'vitest';
import { localePath, switchLocalePath, otherLocale, ui } from './i18n';

describe('localePath', () => {
  it('keeps ko at root', () => {
    expect(localePath('ko')).toBe('/');
    expect(localePath('ko', '/')).toBe('/');
    expect(localePath('ko', '/my-post')).toBe('/my-post');
    expect(localePath('ko', '/about')).toBe('/about');
  });

  it('prefixes en with /en', () => {
    expect(localePath('en')).toBe('/en');
    expect(localePath('en', '/')).toBe('/en');
    expect(localePath('en', '/my-post')).toBe('/en/my-post');
    expect(localePath('en', '/about')).toBe('/en/about');
  });
});

describe('otherLocale', () => {
  it('flips locales', () => {
    expect(otherLocale('ko')).toBe('en');
    expect(otherLocale('en')).toBe('ko');
  });
});

describe('switchLocalePath', () => {
  it('maps home to home', () => {
    expect(switchLocalePath('/', 'en', [])).toBe('/en');
    expect(switchLocalePath('/en', 'ko', [])).toBe('/');
  });

  it('maps about to about', () => {
    expect(switchLocalePath('/about', 'en', [])).toBe('/en/about');
    expect(switchLocalePath('/en/about', 'ko', [])).toBe('/about');
  });

  it('maps a post when counterpart exists', () => {
    expect(switchLocalePath('/what-is-rag', 'en', ['what-is-rag'])).toBe('/en/what-is-rag');
    expect(switchLocalePath('/en/what-is-rag', 'ko', ['what-is-rag'])).toBe('/what-is-rag');
  });

  it('falls back to home when counterpart is missing', () => {
    expect(switchLocalePath('/ko-only-post', 'en', [])).toBe('/en');
    expect(switchLocalePath('/en/en-only-post', 'ko', [])).toBe('/');
  });
});

describe('ui dictionary', () => {
  it('has identical key sets for both locales', () => {
    expect(Object.keys(ui.en).sort()).toEqual(Object.keys(ui.ko).sort());
  });

  it('formats reading time per locale', () => {
    expect(ui.ko.minRead(7)).toBe('7분');
    expect(ui.en.minRead(7)).toBe('7 min read');
  });
});
