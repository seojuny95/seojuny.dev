import { describe, it, expect } from 'vitest';
import { splitIntoChunks, matchable } from './speech';

describe('splitIntoChunks', () => {
  it('splits on sentence terminators and keeps them', () => {
    expect(splitIntoChunks('안녕하세요. 반갑습니다!')).toEqual([
      '안녕하세요.',
      '반갑습니다!',
    ]);
  });

  it('splits on newlines (paragraph breaks)', () => {
    expect(splitIntoChunks('첫 줄\n둘째 줄')).toEqual(['첫 줄', '둘째 줄']);
  });

  it('drops empty and whitespace-only chunks', () => {
    expect(splitIntoChunks('하나.\n\n   \n둘.')).toEqual(['하나.', '둘.']);
  });

  it('collapses internal whitespace within a chunk', () => {
    expect(splitIntoChunks('여러   공백이    있는   문장')).toEqual([
      '여러 공백이 있는 문장',
    ]);
  });

  it('returns empty array for empty or blank input', () => {
    expect(splitIntoChunks('')).toEqual([]);
    expect(splitIntoChunks('   \n  ')).toEqual([]);
  });

  it('splits an over-long terminator-less chunk at a word boundary', () => {
    const word = '가나다라마';
    const text = Array.from({ length: 60 }, () => word).join(' '); // 60 words, no terminator
    const chunks = splitIntoChunks(text, 100);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(100);
      expect(c).not.toMatch(/^\s|\s$/); // trimmed
    }
    // no content lost
    expect(chunks.join(' ')).toBe(text);
  });
});

describe('matchable', () => {
  it('keeps letters and numbers, lowercased', () => {
    expect(matchable('RAG4')).toBe('rag4');
  });

  it('strips spaces and punctuation', () => {
    expect(matchable('안녕, 하세요!')).toBe('안녕하세요');
  });

  it('strips the heading anchor # so DOM and JSON text still match', () => {
    expect(matchable('핵심 구조 #')).toBe('핵심구조');
  });

  it('ignores a trailing period (generator-added vs DOM)', () => {
    expect(matchable('왜 필요한가.')).toBe(matchable('왜 필요한가'));
  });

  it('keeps Hangul and Latin together, dropping the dash', () => {
    expect(matchable('self-attention')).toBe('selfattention');
  });

  it('returns empty string for punctuation/space only', () => {
    expect(matchable('  —  ')).toBe('');
  });
});
