export function createSvgElement(name: string, attrs: { [attrName: string]: any } = {}, properties: { [propName: string]: any } = {}): SVGElement {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name) as any;
  for (const attrName in attrs)
    element.setAttribute(attrName, attrs[attrName]);
  for (const propName in properties)
    element[propName] = properties[propName]
  return element;
}