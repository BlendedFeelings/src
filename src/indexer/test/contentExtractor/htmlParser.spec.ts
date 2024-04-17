import { HtmlParser } from '../../lib/contentExtractor/htmlParser';
import { ConsoleLoggerProvider } from '../../lib/logger/console';
import {describe, expect, test} from '@jest/globals';

test("convert html to text", () => {
    let results = new HtmlParser({loggerProvider:new ConsoleLoggerProvider()}).parse('<div>first dev</div><div>second div</div>');
    expect(results.contentText).toBe("first dev second div");
});
  
test("return headings from html", () => {
    let results = new HtmlParser({loggerProvider:new ConsoleLoggerProvider()}).parse('<h1>Heading1</h1><h2>Heading2</h2>');
    expect(results.headings).toEqual([ {tag:'h1', text: 'Heading1'}, {tag:'h2', text: 'Heading2'} ]); 
});
