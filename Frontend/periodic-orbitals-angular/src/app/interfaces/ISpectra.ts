export interface IWaveIntensity {
  w: number;
  i: number;
}

export interface ISpectrum {
  symbol: string;
  spectral_lines: IWaveIntensity[];
}
