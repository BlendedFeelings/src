
export type IndexItem = {
    path: string
    type: 'file'|'folder',
    title: string|null,
    content: string|null,
    sourceType: string
    sourceUri: string
    sourcePath: string
    sha: string|null
}

export type WebIndexItem = {
  id?: string|null,
  incrementalID?: string,
  indexItem?: IndexItem|null,
  content?: string|null,
  title?: string|null,
  includesItem?: IncludesItem|null,
}

export type IncludesItem = {
  includes: {
    path: string,
    content: string|null
  }[]
}
