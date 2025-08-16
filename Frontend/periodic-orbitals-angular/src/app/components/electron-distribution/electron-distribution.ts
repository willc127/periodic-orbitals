import { Component } from '@angular/core';

@Component({
  selector: 'app-electron-distribution',
  imports: [],
  templateUrl: './electron-distribution.html',
  styleUrl: './electron-distribution.css'
})
export class ElectronDistribution {

}

const chemicals = [['H','Hydrogenium','Hydrogen',0],['He','Helium','Helium',1],['Li','Lithium','Lithium',2],['Be','Beryllium','Beryllium',3],['B','Borum','Boron',4],['C','Carboneum','Carbon',5],['N','Nitrogenium','Nitrogen',5],['O','Oxygenium','Oxygen',5],['F','Fluorum','Fluorine',5],['Ne','Neon','Neon',1],['Na','Natrium','Sodium',2],['Mg','Magnesium','Magnesium',3],['Al','Aluminium','Aluminium',6],['Si','Silicium','Silicon',4],['P','Phosphorus','Phosphorus',5],['S','Sulphur','Sulfur',5],['Cl','Chlorum','Chlorine',5],['Ar','Argon','Argon',1],['K','Kalium','Potassium',2],['Ca','Calcium','Calcium',3],['Sc','Scandium','Scandium',7],['Ti','Titanium','Titanium',7],['V','Vanadium','Vanadium',7],['Cr','Chromium','Chromium',7],['Mn','Manganum','Manganese',7],['Fe','Ferrum','Iron',7],['Co','Cobaltum','Cobalt',7],['Ni','Niccolum','Nickel',7],['Cu','Cuprum','Copper',7],['Zn','Zincum','Zinc',7],['Ga','Gallium','Gallium',6],['Ge','Germanium','Germanium',4],['As','Arsenicum','Arsenic',4],['Se','Selenium','Selenium',5],['Br','Bromum','Bromine',5],['Kr','Krypton','Krypton',1],['Rb','Rubidium','Rubidium',2],['Sr','Strontium','Strontium',3],['Y','Yttrium','Yttrium',7],['Zr','Zirconium','Zirconium',7],['Nb','Niobium','Niobium',7],['Mo','Molybdaenum','Molybdenum',4],['Tc','Technetium','Technetium',7],['Ru','Ruthenium','Ruthenium',7],['Rh','Rhodium','Rhodium',7],['Pd','Palladium','Palladium',7],['Ag','Argentum','Silver',7],['Cd','Cadmium','Cadmium',7],['In','Indium','Indium',6],['Sn','Stannum','Tin',6],['Sb','Stibium','Antimony',4],['Te','Tellurium','Tellurium',7],['I','Iodium','Iodine',5],['Xe','Xenon','Xenon',1],['Cs','Caesium','Cesium',2],['Ba','Barium','Barium',3],['La','Lanthanum','Lanthanum',8],['Ce','Cerium','Cerium',8],['Pr','Praseodymium','Praseodymium',8],['Nd','Neodymium','Neodymium',8],['Pm','Promethium','Promethium',8],['Sm','Samarium','Samarium',8],['Eu','Europium','Europium',8],['Gd','Gadolinium','Gadolinium',8],['Tb','Terbium','Terbium',8],['Dy','Dysprosium','Dysprosium',8],['Ho','Holmium','Holmium',8],['Er','Erbium','Erbium',8],['Tm','Thulium','Thulium',8],['Yb','Ytterbium','Ytterbium',8],['Lu','Lutetium','Lutetium',8],['Hf','Hafnium','Hafnium',7],['Ta','Tantalum','Tantalum',7],['W','Wolframium','Tungstenn',7],['Re','Rhenium','Rhenium',7],['Os','Osmium','Osmium',7],['Ir','Iridium','Iridium',7],['Pt','Platinum','Platinumm',7],['Au','Aurum','Gold',7],['Hg','Hydrargyrum','Mercury',7],['Tl','Thallium','Thallium',6],['Pb','Plumbum','Lead',6],['Bi','Bismuthum','Bismuth',6],['Po','Polonium','Polonium',6],['At','Astatum','Astatine',4],['Rn','Radon','Radonn',1],['Fr','Francium','Francium',2],['Ra','Radium','Radium',3],['Ac','Actinium','Actinium',9],['Th','Thorium','Thorium',9],['Pa','Protactinium','Protactinium',9],['U','Uranium','Uranium',9],['Np','Neptunium','Neptunium',9],['Pu','Plutonium','Plutonium',9],['Am','Americium','Americium',9],['Cm','Curium','Curium',9],['Bk','Berkelium','Berkelium',9],['Cf','Californium','Californium',9],['Es','Einsteinium','Einsteinium',9],['Fm','Fermium','Fermiumm',9],['Md','Mendelevium','Mendelevium',9],['No','Nobelium','Nobelium',9],['Lr','Lawrencium','Lawrencium',9],['Rf','Rutherfordium','Rutherfordium',7],['Db','Dubnium','Dubnium',7],['Sg','Seaborgium','Seaborgium',7],['Bh','Bohrium','Bohrium',7],['Hs','Hassium','Hassium',7],['Mt','Meitnerium','Meitnerium',7],['Ds','Darmstadtium','Darmstadtium',7],['Rg','Roentgenium','Roentgenium',7],['Cn','Copernicium','Copernicium',7],['Nh','Nihonium','Nihonium',6],['Fl','Flerovium','Flerovium',6],['Mc','Moscovium','Moscovium',6],['Lv','Livermorium','Livermorium',6],['Ts','Tennessine','Tennessine',6],['Og','Oganesson','Oganesson',1]]
const chemicalColors = ['#DDD','#22F', '#F22', '#F92', '#2F9', '#29F', '#2F2', '#FF2', '#F2F', '#92F']

function normalizeString (string) {
  return string.toLowerCase()
}
  
function getChemical (search) {
  let chemical, symbol, atomicNumber, latin, name, color, colorCode
  
  if (chemicals[search - 1])
    chemical = chemicals[search - 1]
  
  else {
    const normSearch = normalizeString(search)
    const result = chemicals.find(chemical => {
      if(!chemical || !normSearch) return false
      
      for (let i = 0; i < chemical.length - 1; i++) {
        const info = normalizeString(chemical[i])
        
        if (info.startsWith(normSearch))
          return true
      }
      return false
    })
    
    chemical = result ? result : undefined
  }
  
  [symbol, latin, name, colorCode] = chemical
  atomicNumber = chemicals.indexOf(chemical) + 1
  color = chemicalColors[colorCode]
  
  return { symbol, atomicNumber, latin, name, color }
}


// Canvas Painting 
// https://codepen.io/FelixLuciano/pen/vYOKjQM

class MyPainting extends CanvasPainting {
  scope () {
    return {
      background: '#333',
      orbitColor: '#DDD',
      textColor: '#FFF',
      atomicNumber: 24,
      shells: Array,
      size: Math.max(this.width, this.height) * 9/20,
      offset: 0,
      animate: true
    }
  }
  
  draw () {
    const { background, orbitColor, textColor, atomicNumber, shells, size, offset } = this.$scope
    const { symbol:chemicalSymbol, latin:chemicalLatin, name:chemicalName, color:chemicalColor } = getChemical(atomicNumber)
    const minOrbitRadius = size / 3
    const orbitLineWidth = size / 2**7
    const electronRadius = size / 30
    const electronClearRadius = electronRadius * 2
    const nucleusRadius = size / 6
    const originX = this.width / 2
    const originY = this.height / 2
    const alpha = 2 * Math.PI
    
    let layerRotationSpeed = 1
    
    // Start
    this.ctx2D.save()
    this.ctx2D.fillStyle = chemicalColor
    this.ctx2D.strokeStyle = orbitColor
    this.ctx2D.lineWidth = orbitLineWidth
    this.ctx2D.lineCap = 'round'
    
    // Layers
    shells.forEach((electrons, i) => {
      const radius = i / (shells.length - 1) * (size - minOrbitRadius) + minOrbitRadius
      const layerRotation = offset * layerRotationSpeed
      
      // Draws empty layers line
      if (electrons === 0) {
        this.ctx2D.globalAlpha = .1
        
        this.ctx2D.beginPath()
        this.ctx2D.arc(originX, originY, radius, 0, alpha)
        this.ctx2D.stroke()
        
        return
      }
      
      if (this.ctx2D.globalAlpha < 1)
        this.ctx2D.globalAlpha = 1
      
      for (let j = 0; j < electrons; j++) {
        const phi1 = j / electrons * alpha + layerRotation
        const phi2 = phi1 + 1 / electrons * alpha
        const posX = originX + radius * Math.cos(phi1)
        const posY = originY + radius * Math.sin(phi1)
        const orbitalSpacing = electronClearRadius / radius
        
        // Draws layer lines between electrons
        if (phi2 - phi1 - 2*orbitalSpacing > 0) {
          this.ctx2D.beginPath()
          this.ctx2D.arc(originX, originY, radius, phi1 + orbitalSpacing, phi2 - orbitalSpacing)
          this.ctx2D.stroke()
        }
        
        // Draws Electrons
        this.ctx2D.beginPath()
        this.ctx2D.arc(posX, posY, electronRadius, 0, alpha)
        this.ctx2D.fill()
      }
      
      layerRotationSpeed *= -1
    })
    
    if (this.ctx2D.globalAlpha < 1)
      this.ctx2D.globalAlpha = 1
    
    // Draws nucleus
    this.ctx2D.beginPath()
    this.ctx2D.arc(originX, originY, nucleusRadius, 0, alpha)
    this.ctx2D.fill()
    
    // shadow overlay
    this.ctx2D.fillStyle = background
    const overlay = this.ctx2D.createLinearGradient(0, 0, 75, 120)
    overlay.addColorStop(.5, this.ctx2D.fillStyle)
    overlay.addColorStop(1, this.ctx2D.fillStyle + '00')
    
    this.$clear(overlay)

    // Draws type
    this.ctx2D.font = '32px sans-serif'
    this.ctx2D.fillStyle = chemicalColor
    this.ctx2D.fillText('[', 16, 42)
    
    this.ctx2D.fillStyle = textColor
    this.ctx2D.fillText(chemicalSymbol, 28, 45)
    
    const chemicalSymbolWidth = this.ctx2D.measureText(chemicalSymbol).width
    
    this.ctx2D.fillStyle = chemicalColor
    this.ctx2D.fillText(']', 30 + chemicalSymbolWidth, 42)
    
    this.ctx2D.font = '16px sans-serif'
    this.ctx2D.fillStyle = textColor
    this.ctx2D.fillText(atomicNumber.toString(), 42 + chemicalSymbolWidth, 28)
    
    this.ctx2D.font = '22px sans-serif'
    this.ctx2D.fillText(chemicalName, 16, 75)
    
    this.ctx2D.font = 'italic 16px sans-serif'
    this.ctx2D.fillText(chemicalLatin, 16, 95)
    
    // End
    this.ctx2D.restore()
  }
  
  beforeInit() {
    const { atomicNumber } = this.$scope
    const gui = new dat.GUI()
    
    // Electronic Algorithm v3 🌌
    // https://codepen.io/FelixLuciano/pen/PVMrEO
    const distributeElectrons = (atomicNumber) => {
      const atom = new Atom(atomicNumber)
      this.$scope.shells = atom.shells
    }
    
    const openOnGoogle = () => {
      const { name:chemicalName } = getChemical(this.$scope.atomicNumber)
      
      window.open(`https://www.google.com/search?q=Chemical+element+${ chemicalName }`, '_blank', 'noopener')
    }
    
    gui.add({'Search': ''}, 'Search')
      .onChange(search => {
        const atomicNumber = this.$scope.atomicNumber = getChemical(search).atomicNumber
        distributeElectrons(atomicNumber)
      })
    
    gui.add(this.$scope, 'atomicNumber', 1, 118, 1)
      .onChange(val => distributeElectrons(val))
    
    gui.add(this.$scope, 'size', 0, Math.max(this.width, this.height))
    gui.add(this.$scope, 'animate')
    gui.add({'Open on Google': openOnGoogle}, 'Open on Google')
    
    distributeElectrons(atomicNumber)
  }
  
  loop () {
    if (this.$scope.animate)
      this.$scope.offset = (this.$scope.offset + 2**-8) % (2*Math.PI)
  }
}


window.customElements.define('my-painting', MyPainting, {extends: 'canvas'})

