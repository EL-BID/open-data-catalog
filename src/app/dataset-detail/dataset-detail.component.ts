import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import * as Papa from 'papaparse';  // Importa PapaParse para procesar CSV
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
  dataset: any;
  datasetContent: any[] = [];  // Array para almacenar los objetos JSON de cada fila
  loading = true; // Variable de estado de carga
  currentPage = 0;
  rowsPerPage = 10;  // Número de filas por página

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.category = this.route.snapshot.paramMap.get('category');
    this.filename = this.route.snapshot.paramMap.get('filename');

    if (this.category && this.filename) {
      this.loadDatasetMetadata();
      this.loadDatasetContent();
    } else {
      console.error('No se han proporcionado los parámetros de category o filename.');
      this.loading = false; // Detener carga si no hay parámetros
    }
  }

  loadDatasetMetadata(): void {
    this.dataService.getMetadata().subscribe(data => {
      this.dataset = data.find(d => d.category === this.category && d.filename === this.filename);
      if (!this.dataset) {
        console.error('Dataset no encontrado.');
      }
    });
  }

  loadDatasetContent(): void {
    if (this.category && this.filename) {
      this.loading = true;
      console.log(`Cargando dataset para categoría: ${this.category}, archivo: ${this.filename}`);

      this.dataService.getDataset(this.category, this.filename).subscribe(
        content => {
          console.log('Contenido recibido:', content);

          if (!content || content.length === 0) {
            console.error('El contenido del CSV está vacío o no se recibió correctamente');
            this.loading = false;
            return;
          }

          // Usar PapaParse para procesar el CSV
          Papa.parse(content, {
            header: true,
            delimiter: ",",
            skipEmptyLines: true, // Omite líneas vacías
            dynamicTyping: true,   // Convierte los tipos de datos según el contenido
            complete: (result) => {
              console.log('Resultado del parseo:', result);
              if (result.errors.length > 0) {
                result.errors.forEach(error => {
                  console.error('Error en el CSV:', error.message);
                });
              } else {
                // Guardar el contenido parseado
                this.datasetContent = result.data;
              }
              this.loading = false;
            },
            error: (error) => {
              console.error('Error al parsear el CSV:', error);
              this.loading = false;
            }
          });
        },
        error => {
          console.error('Error al cargar el dataset:', error);
          this.loading = false;
        }
      );
    }
  }

  // Método para obtener las claves de un objeto (las cabeceras de las columnas)
  objectKeys(obj: any) {
    return Object.keys(obj);
  }

  downloadDataset(): void {
    if (this.category && this.filename) {
      this.dataService.downloadDataset(this.category, this.filename).subscribe((response: Blob) => {
        const blob = new Blob([response], { type: 'text/csv' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${this.filename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } else {
      console.error('Filename no disponible para descargar');
    }
  }

  get paginatedDataset() {
    const start = this.currentPage * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.datasetContent.slice(start, end);
  }

  nextPage() {
    if ((this.currentPage + 1) * this.rowsPerPage < this.datasetContent.length) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
}
