import { MarkdownParser } from '../../lib/contentExtractor/markdownParser';
import { HtmlParser } from '../../lib/contentExtractor/htmlParser';
import { ConsoleLoggerProvider } from '../../lib/logger/console';
import {describe, expect, test} from '@jest/globals';

test("convert markdown to text", () => {
    let results = new MarkdownParser({loggerProvider:new ConsoleLoggerProvider()}).parse('# title');
    expect("title \n").toBe(results.contentText);
});


test("skip metadata", () => {
    let results = new MarkdownParser({loggerProvider:new ConsoleLoggerProvider()}).parse(`---
title: Some title
tags: tag1,tag2
---`);
    expect("").toBe(results.contentText);
});


test("return headings", () => {
    let results = new MarkdownParser({loggerProvider:new ConsoleLoggerProvider()}).parse(`---
tags: [value1,value2]
---
# Heading1
## Heading2
`);
    expect([ {tag:'h1', text: 'Heading1'}, {tag:'h2', text: 'Heading2'} ]).toEqual(results.headings);
});

test("include links", () => {
    let results = new MarkdownParser({loggerProvider:new ConsoleLoggerProvider()}).parse('https://github.com/');
    expect('https://github.com/').toBe(results.contentText?.trim());
});

test("include videos urls", () => {
    let results = new MarkdownParser({loggerProvider:new ConsoleLoggerProvider()}).parse('https://www.youtube.com/embed/J7DzL2_Na80');
    expect('https://www.youtube.com/embed/J7DzL2_Na80').toBe(results.contentText?.trim());
});

test("include hashtags", () => {
    let results = new MarkdownParser({loggerProvider:new ConsoleLoggerProvider()}).parse('#course #lecture');
    expect('#course #lecture').toBe(results.contentText?.trim());
});
