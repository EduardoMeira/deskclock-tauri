import { describe, it, expect } from "vitest";
import { snapToGrid, snapPositionToGrid, GRID_SIZE } from "@shared/utils/snapToGrid";

describe("snapToGrid", () => {
  it("arredonda para o múltiplo mais próximo do grid", () => {
    expect(snapToGrid(0)).toBe(0);
    expect(snapToGrid(8)).toBe(16);   // metade exata → arredonda para cima
    expect(snapToGrid(7)).toBe(0);    // abaixo da metade → arredonda para baixo
    expect(snapToGrid(9)).toBe(16);   // acima da metade → arredonda para cima
    expect(snapToGrid(16)).toBe(16);  // exato
    expect(snapToGrid(32)).toBe(32);  // múltiplo exato
    expect(snapToGrid(25)).toBe(32);  // próximo de 32
  });

  it("usa GRID_SIZE como padrão", () => {
    expect(GRID_SIZE).toBe(16);
  });

  it("aceita gridSize customizado", () => {
    expect(snapToGrid(10, 20)).toBe(20);
    expect(snapToGrid(9, 20)).toBe(0);
    expect(snapToGrid(40, 20)).toBe(40);
  });

  it("funciona com valores negativos", () => {
    // Math.round(-0.5) === 0 no JS (arredonda para +Infinity)
    expect(snapToGrid(-8)).toBe(0);
    expect(snapToGrid(-7)).toBe(0);
    expect(snapToGrid(-9)).toBe(-16);
  });
});

describe("snapPositionToGrid", () => {
  it("aplica snap em x e y independentemente", () => {
    expect(snapPositionToGrid(7, 25)).toEqual({ x: 0, y: 32 });
    expect(snapPositionToGrid(16, 16)).toEqual({ x: 16, y: 16 });
    expect(snapPositionToGrid(0, 0)).toEqual({ x: 0, y: 0 });
  });
});
