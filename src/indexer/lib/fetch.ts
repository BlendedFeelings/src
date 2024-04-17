export async function fetch(url:string, options?:{
      headers?: any,
      method?: string,
      body?: string
  }) {
  return await global.fetch(url,options);
}
