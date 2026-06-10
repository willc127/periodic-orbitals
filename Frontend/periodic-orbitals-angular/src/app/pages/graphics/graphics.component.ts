import { Component, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { Chart, ScatterController, LinearScale, PointElement, Tooltip } from 'chart.js';

Chart.register(ScatterController, LinearScale, PointElement, Tooltip);

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [],
  templateUrl: './graphics.html',
  styleUrls: ['./graphics.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphicsComponent {


  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    const data = Array.from({ length: 50 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
  
      new Chart(this.canvasRef.nativeElement, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Pontos',
            data,
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            pointRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'X' } },
            y: { title: { display: true, text: 'Y' } },
          },
        },
      });
  }

}
