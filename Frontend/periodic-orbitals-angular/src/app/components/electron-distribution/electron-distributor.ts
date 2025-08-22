export class Distributor {
  atomic: number;
  electronicDiagram!: number[][];

  constructor(atomic: number) {
    this.atomic = atomic;

    this.buildElectronicDiagram();
    this.distributeElectrons();
  }

  // Cria uma matriz 2D não-linear seguindo o princípio de Aufbau
  buildElectronicDiagram(): void {
    this.electronicDiagram = new Array(7).fill(0).map((_, x) => {
      const length = 4.5 - Math.abs(x - 3.5); // número de colunas de cada linha
      return new Array(Math.floor(length)).fill(0);
    });
  }

  distributeElectrons(): void {
    let electrons = this.atomic;
    let layer = 0;
    let sublevel = 0;

    while (electrons > 0) {
      let x = layer;
      let y = sublevel;

      for (; y >= 0 && x <= 6; x++, y--) {
        const maxDecay = 2 + 4 * y; // limite de elétrons por subnível
        const decay = Math.min(electrons, maxDecay);

        this.electronicDiagram[x][y] = decay;
        electrons -= decay;
      }

      if (layer === sublevel) layer++;
      else sublevel++;
    }
  }

  // Retorna o total de elétrons em cada camada
  get shells(): number[] {
    return this.electronicDiagram.map((layer) =>
      layer.reduce((a, b) => a + b, 0),
    );
  }
}
