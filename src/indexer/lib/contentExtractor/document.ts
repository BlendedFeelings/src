export type Document = {
    contentText: string|null
    //meta: { title: string|null, description: string|null, image: string|null, date: string|null, source: string|null, tags: Array<string>|null}|null
    headings: {tag: string, text: string}[]|null
    urls: string[]
  }
  