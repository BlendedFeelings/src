import * as pathTools from 'path'

export function getCumulativePath(path:string|null): string[]
{
	if (!path)
		return [];
	let pathSegments = path.split('/');
	let cumulativeSegments:string[] = [];
	for(let i = 0; i < pathSegments.length; i++){
		cumulativeSegments.push(pathSegments.slice(0, i + 1).join('/'));
	}
	return cumulativeSegments;
}

export function getCumulativePathWithName(path:string|null|undefined): {path:string,name:string}[]
{
	if (!path)
		return [];
	let pathSegments = path.split('/');
	let cumulativeSegments:{path:string,name:string}[] = [];
	for(let i = 0; i < pathSegments.length; i++){
		let path = pathSegments.slice(0, i + 1).join('/');
		cumulativeSegments.push({path,name:pathTools.basename(path)});
	}
	return cumulativeSegments;
}

export function getParentPath(path:string|null|undefined) {
	if (!path)
		return null;
	return path.split('/').slice(0, -1).join('/')
}

export function isPrivate(path:string) {
	let parts = path.split('/');
	if (parts.some(s => s.startsWith('.') || s.startsWith('_')))
		return true;
	return false;
}

export function parsePath(path: string) {
    let segments = path.split(/\/(.*)/s); // split using first slash, learning/cambridge/some-couser.md => ['learning','cambridge/some-couser.md']
    let basePath = segments[0].toLowerCase(); // learning
    let sourcePath = segments[1]; // cambridge/some-couser.md
    return { basePath, sourcePath };
}

