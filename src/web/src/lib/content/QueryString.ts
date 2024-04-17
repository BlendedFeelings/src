export function toQueryString(params:Record<string, string|null>) {
    if (params['v'] === 'latest')
        delete params['v'];
    let keys = Object.keys(params).filter(k => params[k]);
    if (keys.length === 0)
        return "";
    return "?" + keys
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]!))
        .join('&');
}