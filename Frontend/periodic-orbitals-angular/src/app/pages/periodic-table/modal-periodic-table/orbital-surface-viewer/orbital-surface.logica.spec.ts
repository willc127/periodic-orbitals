import { criarModeloOrbital, tabelaRadialSecao } from './orbital-surface.logica';

describe('tabelaRadialSecao', () => {
  it('normalizes the section distribution', () => {
    const tabela = tabelaRadialSecao(
      criarModeloOrbital(1, 0, 0),
      'XY',
      0,
      15,
      0,
    );
    const dr = tabela.r[1] - tabela.r[0];
    let integral = 0;

    for (let i = 1; i < tabela.p.length; i++) {
      integral += 0.5 * (tabela.p[i - 1] + tabela.p[i]) * dr;
    }

    expect(integral).toBeCloseTo(1, 3);
  });

  it('changes when the section offset changes', () => {
    const modelo = criarModeloOrbital(1, 0, 0);
    const central = tabelaRadialSecao(modelo, 'XY', 0, 15, 0);
    const deslocada = tabelaRadialSecao(modelo, 'XY', 1, 15, 0);

    expect(Array.from(deslocada.p)).not.toEqual(Array.from(central.p));
  });

  it('returns zero when the section no longer intersects the orbital', () => {
    const tabela = tabelaRadialSecao(
      criarModeloOrbital(1, 0, 0),
      'XY',
      10,
      15,
      1e-8,
    );

    expect(Array.from(tabela.p).every((value) => value === 0)).toBeTrue();
  });
});
