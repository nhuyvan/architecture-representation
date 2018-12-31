import { Injectable } from '@angular/core';

type Color = { r: number; g: number; b: number };

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  private readonly _idToColor: { [id: string]: string } = {};
  private readonly _colors: Color[] = [];

  constructor() { }

  updateColorForIdSelector(idSelector: string, color: string) {
    this._idToColor[idSelector] = color;
  }

  generateLinkColorForIdSelector(idSelector: string): string {
    if (!(idSelector in this._idToColor)) {
      const color = this._generateNextNonSimilarShadeColor();
      this._colors.push(color);
      this._idToColor[idSelector] = this._generateRgbString(color);
    }
    return this._idToColor[idSelector];
  }

  private _generateNextNonSimilarShadeColor(): Color {
    let newColor = this._generateColor();
    while (this._hasSimilarShade(newColor))
      newColor = this._generateColor();
    return newColor;
  }

  private _generateRgbString(color: Color) {
    return `rgb(${color.r},${color.g},${color.b})`;
  }

  private _generateColor(): Color {
    return {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    };
  }

  private _hasSimilarShade(newColor: Color) {
    return this._colors.some(color => this._isSimilarShade(color, newColor));
  }

  private _isSimilarShade(color1: Color, color2: Color) {
    return Math.abs(color1.r - color2.r) + Math.abs(color1.g - color2.g) + Math.abs(color1.b - color2.b) <= 40;
  }

}
