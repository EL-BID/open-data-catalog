import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dataset-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dataset-detail.component.html',
  styleUrls: ['./dataset-detail.component.scss']
})
export class DatasetDetailComponent implements OnInit {
  category: string | null = null;
  filename: string | null = null;
  dataset: any;  // Esto almacenará la información del dataset que estamos buscando
  datasetContent: string | null = null;  // Aquí guardarás el contenido del dataset, si lo cargas en texto o JSON

  constructor(
    private route: ActivatedRoute,       // Para acceder a los parámetros de la URL
    private dataService: DataService     // Para obtener la metadata y los archivos
  ) {}

  ngOnInit(): void {
    // Obtiene los parámetros 'category' y 'filename' de la URL
    this.category = this.route.snapshot.paramMap.get('category');
    this.filename = this.route.snapshot.paramMap.get('filename');

    if (this.category && this.filename) {
      this.loadDatasetMetadata();
      this.loadDatasetContent();
    } else {
      console.error('No se han proporcionado los parámetros de category o filename.');
    }
  }

  // Método para cargar la metadata del dataset
  loadDatasetMetadata(): void {
    this.dataService.getMetadata().subscribe(data => {
      // Buscar el dataset basado en category y filename
      this.dataset = data.find(d => d.category === this.category && d.filename === this.filename);
      if (!this.dataset) {
        console.error('Dataset no encontrado.');
      }
    });
  }

  // Método para cargar el contenido del dataset
  loadDatasetContent(): void {
    if (this.category && this.filename) {
      this.dataService.getDataset(this.category, this.filename).subscribe(content => {
        this.datasetContent = content;
      });
    }
  }

  // Método para descargar el dataset CSV
  downloadDataset(): void {
    if (this.category && this.filename) {
      this.dataService.downloadDataset(this.category, this.filename).subscribe((response: Blob) => {
        const blob = new Blob([response], { type: 'text/csv' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${this.filename}.csv`;  // Nombre del archivo para la descarga
        link.click();
        URL.revokeObjectURL(url); // Limpiar la URL
      });
    } else {
      console.error('Filename no disponible para descargar');
    }
  }
}
