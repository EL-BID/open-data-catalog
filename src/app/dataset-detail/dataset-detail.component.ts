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
  mydataCategory: string | null = null;
  titleOriginal: string | null = null;
  mydataId: string | null = null;
  filename: string | null = null;
  dataset: any;
  datasetContent: any[] = [];
  loading = true;
  datasetPath: string | null = null;
  currentPage = 0;
  rowsPerPage = 10;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}


  ngOnInit(): void {
     this.mydataCategory = this.route.snapshot.paramMap.get('mydata_category');
     this.titleOriginal = this.route.snapshot.paramMap.get('title_original');
     this.mydataId = this.route.snapshot.paramMap.get('mydata_id');

     console.log("mydataCategory:", this.mydataCategory);  // Verificar que se está capturando correctamente
  console.log("titleOriginal:", this.titleOriginal);    // Verificar que se está capturando correctamente
  console.log("mydataId:", this.mydataId);              // Verificar que se está capturando correctamente


     this.loadMetadata();
   }

    // Función de normalización para comparar títulos
  normalizeTitle(title: string | null): string {
    return title ? title.trim().replace(/[^a-zA-Z0-9 ]/g, '-').substring(0, 50) : '';  // Normalizamos y cortamos a 50 caracteres
  }

  loadMetadata(): void {
    this.dataService.getMetadata().subscribe(data => {
      console.log('Metadata:', data);
      console.log('titleOriginal en la URL:', this.titleOriginal);

      if (this.titleOriginal) {
        const formattedTitleFromUrl = this.titleOriginal
          .replace(/[^a-zA-Z0-9]+/g, '-')
          .substring(0, 50);

        // Busca el dataset, considerando si `mydataCategory` es nulo o no
        this.dataset = data.find(d => {
          const formattedTitleFromMetadata = d.title_original
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .substring(0, 50);

          const categoryMatches = this.mydataCategory ? d.mydata_category === this.mydataCategory : true;
          const idMatches = d.mydata_id === this.mydataId;

          console.log('Comparando con title_original en metadata:', formattedTitleFromMetadata);

          return (
            categoryMatches &&
            idMatches &&
            formattedTitleFromMetadata === formattedTitleFromUrl
          );
        });

        if (this.dataset) {
          this.loadDatasetContent();
        } else {
          console.error('Dataset no encontrado en la metadata. Revisa los parámetros.');
          this.loading = false;
        }
      } else {
        console.error('titleOriginal es nulo o no definido.');
        this.loading = false;
      }
    }, error => {
      console.error('Error al cargar la metadata:', error);
      this.loading = false;
    });
  }



  // Método para cargar el contenido del dataset
  loadDatasetContent(): void {
    if (this.dataset) {
      const filenameFromMetadata = this.dataset.filename;

      if (filenameFromMetadata) {
        // Asegúrate de pasar solo el nombre del archivo
        const formattedFilename = filenameFromMetadata.replace(/[^a-zA-Z0-9\-\.]+/g, '-');

        this.dataService.getDataset(formattedFilename).subscribe(content => {
          console.log('Contenido recibido:', content);

          // Usar PapaParse para procesar el CSV
          Papa.parse(content, {
            header: true,
            delimiter: ",",
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (result) => {
              console.log('Resultado del parseo:', result);
              this.datasetContent = result.data;
              this.loading = false;
            },
            error: (error) => {
              console.error('Error al parsear el CSV:', error);
              this.loading = false;
            }
          });
        }, error => {
          console.error('Error al cargar el dataset:', error);
          this.loading = false;
        });
      } else {
        console.error('No se encontró el filename en la metadata.');
        this.loading = false;
      }
    } else {
      console.error('No se ha encontrado el dataset en la metadata.');
      this.loading = false;
    }
  }



  downloadDataset(): void {
    if (this.titleOriginal) {
      const formattedFilename = this.titleOriginal.replace(/[^a-zA-Z0-9]+/g, '-');

      this.dataService.downloadDataset(formattedFilename).subscribe((response: Blob) => {
        const blob = new Blob([response], { type: 'text/csv' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${formattedFilename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } else {
      console.error('Filename no disponible para descargar');
    }
  }

  // Método para obtener las claves de un objeto (las cabeceras de las columnas)
  objectKeys(obj: any) {
    return Object.keys(obj);
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
