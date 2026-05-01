
A equação de Schrödinger independente do tempo constitui matematicamente um **problema de autovalor** (ou problema espectral) no espaço de Hilbert das funções de onda. Nessa formulação:
$$
\hat{H} \psi = E \psi
$$

- O operador Hamiltoniano $\hat{H}$ atua como uma transformação linear sobre a função de onda $\psi$;

- As soluções admissíveis $\psi$ são as **autofunções** (ou autovetores) do operador;

- Os valores escalares $E$ associados a cada autofunção são os **autovalores**, que correspondem fisicamente aos níveis de energia permitidos para o sistema.

Aqui:

- $\hat{H}$ é o operador Hamiltoniano do sistema;
- $\psi$ é a [[Função de onda]] do elétron;
- $E$ é a energia total do elétron.

## Decomposição do operador Hamiltoniano

O Hamiltoniano pode ser separado nas contribuições cinética e potencial:

$$
\hat{H} = K + V
$$
**Energia cinética KK:**  
Expressa em termos do operador momento $\hat{{P}}$​ e da massa $m$ do elétron:

$$
    K = \frac{\widehat{P}^2}{2m}
    $$

**Energia potencial VV:**  
Para o elétron sob atração coulombiana do núcleo (carga $e$), a uma distância $r$ da origem:

 $$
    V = - \frac{e^2}{4\pi \epsilon_0 r}
    $$

Assim, a equação de Schrödinger fica:

$$
(K+V) \psi = E \psi
$$
## Representação do momento e equação expandida

Na mecânica quântica, o momento linear é representado pelo operador diferencial:

$$
\widehat{P} = -i \hbar \overrightarrow{\nabla}
$$

Portanto, o operador energia cinética torna-se:
$$
K = \frac{(-i \hbar \overrightarrow{\nabla})^2}{2m} = - \frac{\hbar^2}{2m}\overrightarrow{\nabla}^2
$$

Substituindo na equação de autovalor, obtemos:

$$
- \frac{\hbar^2}{2m}\overrightarrow{\nabla}^2 \psi + V \psi = E \psi
$$

ou, equivalente:

$$
-\frac{\hbar^2}{2m} \overrightarrow{\nabla}^2\psi - \frac{e^2}{4\pi \epsilon_0 r} \psi = E \psi
$$

## Transição para coordenadas esféricas

O problema possui simetria esférica portanto é natural escrever a função de onda em coordenadas esféricas (r,θ,ϕ):

$$
\psi = \psi(r, \theta, \phi)
$$

O Laplaciano nesse sistema coordenadas esféricas é:

$$
\overrightarrow{\nabla}^2 \psi = \frac{1}{r^2} \frac{\partial}{\partial r} \left( r^2 \frac{\partial \psi}{\partial r} \right) + \frac{1}{r^2 \sin \theta} \frac{\partial}{\partial \theta} \left( \sin \theta \frac{\partial \psi}{\partial \theta} \right) + \frac{1}{r^2 \sin^2 \theta} \frac{\partial^2 \psi}{\partial \phi^2}
$$

Substituindo essa expressão na equação de Schrödinger, temos uma equação diferencial parcial ([[EDP]]):

$$
-\frac{\hbar^2}{2m} \left[\frac{1}{r^2} \frac{\partial}{\partial r} \left( r^2 \frac{\partial \psi}{\partial r} \right) + \frac{1}{r^2 \sin \theta} \frac{\partial}{\partial \theta} \left( \sin \theta \frac{\partial \psi}{\partial \theta} \right) + \frac{1}{r^2 \sin^2 \theta} \frac{\partial^2 \psi}{\partial \phi^2} \right] + V \psi = E \psi
$$

## Separação de variáveis

Aqui, o objetivo é resolver essa EDP para a função de onda ($\psi$) e os níveis de energia ($E$). Para isso, utiliza-se o **método de separação de variáveis** onde supõe-se que a função de onda $\psi(r, \theta, \phi)$ possa ser fatorada em uma parte radial $R(r)$ e uma parte angular $Y(θ,ϕ)$:

$$
\psi(r, \theta, \phi) = R(r)Y(\theta,\phi)
$$

Substituindo essa forma na equação do Laplaciano e reorganizando os termos, chega-se a:

$$
\left[\frac{1}{R}\frac{\partial}{\partial r} \left( r^2\frac{\partial R}{\partial r} \right) - \frac{2mr^2}{\hbar^2}(V-E) \right]
+
\frac{1}{Y}\left[\frac{1}{\sin(\theta)} \frac{\partial}{\partial \theta}\left(\sin(\theta)\frac{\partial Y}{\partial \theta}\right) + \frac{1}{\sin^2(\theta)} \frac{\partial^2 Y}{\partial \phi^2}\right]
= 0
$$
 
Como a soma de uma expressão que depende apenas de $r$ com outra que depende apenas de $θ$ e $ϕ$ é sempre igual a zero, cada um desses termos deve ser igual a uma **constante**.  
Por conveniência, escolhe-se essa constante como $λ=l(l+1)$, onde $l$ é um número inteiro não negativo (o número quântico azimutal).
Dessa forma, a EDP original é decomposta em duas equações diferenciais ordinárias: uma radial (em $r$) e outra angular (em $θ,ϕ$), que podem ser resolvidas separadamente. A constante $l(l+1)$ surgirá naturalmente da resolução da equação angular, fornecendo a quantização do momento angular orbital.

## Equação Radial

A partir da separação de variáveis, obtivemos a equação para a parte radial $R(r)$:

$$
\frac{1}{R}\frac{d}{d r} \left( r^2\frac{d R}{d r} \right) - \frac{2mr^2}{\hbar^2}(V-E) = l(l+1)
$$

Substituindo o potencial coulombiano $V = - \frac{e^2}{4\pi \epsilon_0 r}$​, a equação torna-se:

$$
\frac{1}{R}\frac{d}{d r} \left( r^2\frac{d R}{d r} \right) - \frac{2mr^2}{\hbar^2}\left(- \frac{e^2}{4\pi \epsilon_0 r}-E\right) = l(l+1)
$$

## Solução radial para o átomo de hidrogênio $R(r)$

Resolvendo essa EDO, a parte radial $R(r)$ que descreve o elétron no átomo de hidrogênio é dada por:

$$
R(r) = e^{-\frac{r}{a_0n}} \left( \frac{2r}{a_0n} \right)^l\left[ L_{n-l-1}^{2l+1}\left(\frac{2r}{a_0 n}\right)\right]
$$

em que:
- $n$ é o número quântico principal ($n = 1,2,3,\dots$)
- $l$ é o número quântico azimutal ($l = 0,1,2,\dots,n-1$)
- $a_{0}$ é o raio de Bohr, definido como:
$$
a_0 = \frac{4 \pi \epsilon_0 \hbar^2}{m e^2} \approx 0.529\,\mathring{A}
$$

- $L^{2l+1}_{n-l-1}$ são os polinômios associados de Laguerre, cuja expressão nesse contexto é:

$$
L^{2l+1}_{n-l-1}(x) = (-1)^{n-l-1}\left(\frac{d}{dx}\right)^{n-l-1}\left[ \frac{e^x}{(n+l)!}\left(\frac{d}{dx}\right)^{n+l}(e^{-x}x^{n+l})\right]
$$

Esta forma funcional mostra que a parte radial depende apenas dos números quânticos $n$ e $l$, exibindo um decaimento exponencial modulado por um polinômio. O raio de Bohr $a_0$​ estabelece a escala natural de comprimento do sistema.

### Densidades de Probabilidade Radiais

Considerando o número quântico azimutal $l=0$ e variando o número quântico principal $(n=1,2,3,4)$, a solução radial $R(r)$ é representada a seguir por meio de duas figuras complementares:

- **Painel esquerdo (gráfico):** probabilidade de encontrar o elétron em função da distância ao núcleo atômico.
- **Painel direito (ilustração):** nuvem probabilística do elétron ao redor do núcleo.

### $n=1$

![[radial_100.png]]

### $n=2$

![[radial_200.png]]

### $n=3$

![[radial_300.png]]

### $n=4$

![[radial_400.png]]



## Equação dos Harmônicos Esféricos $Y(\theta,\phi)$

A equação para a parte angular $Y(θ,ϕ)$ obtida anteriormente é:

$$
\frac{1}{Y}\left[\frac{1}{\sin(\theta)} \frac{\partial}{\partial \theta}\left(\sin(\theta)\frac{\partial Y}{\partial \theta}\right) + \frac{1}{\sin^2(\theta)} \frac{\partial^2 Y}{\partial \phi^2}\right] = -l(l+1)
$$

Como o operador entre colchetes é separável, propõe-se novamente um produto de funções de uma única variável:
$$
Y(\theta , \phi) = P(\theta)A(\phi)
$$

Substituindo essa forma, multiplicando por $sin⁡^2(\theta)$ e reorganizando, obtemos:

$$
\frac{1}{P}\left[ sin(\theta) \frac{d}{d\theta}\left(sin(\theta)\frac{dP}{d\theta} \right) \right] + l(l+1)sin^2(\theta) + \frac{1}{A} \frac{d^2A}{d\phi^2} = 0
$$

O primeiro e o segundo termos dependem apenas de $\theta$ enquanto o terceiro apenas de $\phi$. Para que a soma seja zero para todos os ângulos, cada grupo deve ser igual a uma constante. Escolhemos a constante de separação como $-m^2$, onde $m$ é o número quântico magnético. Temos, assim, duas novas EDOs correspondentes às partes azimutal e polar.

- Azimutal:
$$
\frac{1}{A} \frac{d^2A}{d\phi^2} = -m^2
$$
- Polar:
$$
\frac{1}{P}\left[ sin(\theta) \frac{d}{d\theta}\left(sin(\theta)\frac{dP}{d\theta} \right) \right] + l(l+1)sin^2(\theta) = m^2
$$
### Equação Azimutal

A solução para $A(\theta)$ é:
$$
A(\phi) = e^{im\phi}
$$
onde há a exigência da função de onda ser unívoca, o que impõe que $m$ seja um número inteiro: $m=0,\pm1,\pm2,\dots$

### Equação Polar

A solução da parte polar é:
$$
P(\theta) = P^m_l(cos(\theta))
$$
- onde as soluções são as funções associadas de Legendre $P^m_l$ definidas como:
$$
P^m_l(x) = (-1)^m(1-x^2)^{\frac{m}{2}}\left( \frac{d}{dx}\right)^mP_l(x)
$$
- onde $P_l(x)$ são os polinômios de Legendre, dados pela fórmula de Rodrigues:
$$
P_l(x) = \frac{1}{2^ll!} \left( \frac{d}{dx} \right)^l(x^2-1)^l
$$

Portanto, reunindo as duas partes, a solução angular completa é:

$$
Y = e^{im\phi}P^m_lcos(\theta)
$$

## Constante de normalização $C$

Até aqui, a função $Y = e^{im\phi}P^m_lcos(\theta)$  resolve a equação angular, mas sua magnitude não está fixada. Em mecânica quântica, a função de onda total (e, por extensão, a parte angular) deve estar **normalizada** de modo que a integral de sua densidade de probabilidade sobre todo o espaço angular seja igual à unidade.

Essa constante pode ser derivada de modo que a integral de sua densidade de probabilidade sobre todo o espaço angular seja igual à unidade. A constante é determinada por:
$$
C = \sqrt{\frac{(2l+1)(l-m)!}{4\pi(l+m)!}}
$$

### Solução final dos Harmônicos Esféricos

Assim, os harmônicos esféricos normalizados são expressos como a expressão a seguir e constituem a base angular completa para a solução do átomo de hidrogênio e de qualquer problema quântico com simetria esférica.

$$
Y =C e^{im\phi}P^m_lcos(\theta)=\sqrt{\frac{(2l+1)(l-m)!}{4\pi(l+m)!}} e^{im\phi}P^m_lcos(\theta)
$$

## Resumo

Portanto, a equação de Schrödinger independente do tempo para o átomo de hidrogénio é a seguinte equação diferencial parcial (EDP) em coordenadas esféricas:
$$
-\frac{\hbar^2}{2m} \left[\frac{1}{r^2} \frac{\partial}{\partial r} \left( r^2 \frac{\partial \psi}{\partial r} \right) + \frac{1}{r^2 \sin \theta} \frac{\partial}{\partial \theta} \left( \sin \theta \frac{\partial \psi}{\partial \theta} \right) + \frac{1}{r^2 \sin^2 \theta} \frac{\partial^2 \psi}{\partial \phi^2} \right] + V \psi = E \psi
$$

Através do método de separação de variáveis, a função de onda é decomposta num produto de três funções, cada uma dependente de uma única coordenada:

$$
\psi(r, \theta, \phi) = R(r)P(\theta)A(\phi)
$$

A solução completa, que satisfaz as condições de finitude, univocidade e normalização, é dada por:

$$
\psi_{nlm}(r,\theta,\phi) = e^{-\frac{r}{a_0n}} \left( \frac{2r}{a_0n} \right)^l L_{n-l-1}^{2l+1}\left(\frac{2r}{a_0 n}\right) \sqrt{\frac{(2l+1)(l-m)!}{4\pi(l+m)!}} e^{im\phi}P^m_lcos(\theta)
$$

Esta solução mostra explicitamente que a função de onda do elétron no átomo de hidrogénio depende de três [[Números quânticos]] inteiros:

- $n$ – número quântico principal ($n=1,2,3,\dots$)
- $l$ – número quântico azimutal ($l=0,1,2,\dots,n−1$)
- $m$ – número quântico magnético ($m=−l,−l+1,\dots,l−1,l$)

Cada terno $(n,l,m)$ define um estado estacionário distinto do sistema, com energia determinada unicamente por $n$ e momento angular quantificado por $l$ e $m$.

### Probabilidade para $n = 5$, $l = 4$, $m = -1$

![[5-4--1-cross-section-xy.png|350]]![[5-4--1-cross-section-xz.png|350]]![[5-4--1-cross-section-yz.png|350]]
#### Fontes:

- https://www.youtube.com/watch?v=ag8tfER8-2g&list=PLWt5FuzgdX4nsEeVG4nBdpDAtIYFq20OG&index=9
- https://www.youtube.com/watch?v=yRJ2Xf2oH5w&list=PLWt5FuzgdX4nsEeVG4nBdpDAtIYFq20OG&index=7&t=544s