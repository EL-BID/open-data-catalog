import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import * as Papa from 'papaparse';  // Importa PapaParse para procesar CSV
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDownload, faEarthAmerica, faCircleInfo, faDatabase, faUserShield, faLink } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dataset-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './dataset-detail.component.html',
  styleUrls: ['./dataset-detail.component.scss']
})
export class DatasetDetailComponent implements OnInit {
  faDownload = faDownload;
  faEarthAmerica = faEarthAmerica;
  faCircleInfo = faCircleInfo;
  faDatabase = faDatabase;
  faUserShield = faUserShield;
  faLink = faLink;
  mydataCategory: string | null = null;
  titleOriginal: string | null = null;
  mydataId: string | null = null;
  filename: string | null = null;
  dataset: any;
  datasetContent: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.mydataCategory = this.route.snapshot.paramMap.get('mydata_category');
    this.titleOriginal = this.route.snapshot.paramMap.get('title_original');
    this.mydataId = this.route.snapshot.paramMap.get('mydata_id');
    console.log("mydataCategory:", this.mydataCategory);
    console.log("titleOriginal:", this.titleOriginal);
    console.log("mydataId:", this.mydataId);
    this.loadMetadata();
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
    if (this.dataset && this.dataset.filename) {
      const filenameFromMetadata = this.dataset.filename;

      // Formateamos el nombre del archivo para asegurar que es seguro
      const formattedFilename = filenameFromMetadata.replace(/[^a-zA-Z0-9\-\.]+/g, '-');

      this.dataService.downloadDataset(formattedFilename).subscribe((response: Blob) => {
        const blob = new Blob([response], { type: 'text/csv' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${formattedFilename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }, error => {
        console.error('Error al descargar el dataset:', error);
      });
    } else {
      console.error('Filename no disponible en la metadata para descargar');
    }
  }

  // Método para obtener las claves de un objeto (las cabeceras de las columnas)
  objectKeys(obj: any) {
    return Object.keys(obj);
  }

  sortCountries(spatial: string | string[]): string {
    if (!spatial) {
      return '';
    }

    if (typeof spatial === 'string') {
      // Si es un string, devolver directamente
      return spatial;
    }

    if (Array.isArray(spatial)) {
      // Ordenar si es un array
      const sortedCountries = spatial.sort((a, b) => a.localeCompare(b));

      if (sortedCountries.length === 1) {
        // Si solo hay un país, devolverlo directamente
        return sortedCountries[0];
      } else if (sortedCountries.length === 2) {
        // Si hay dos países, unirlos con "and"
        return sortedCountries.join(' and ');
      } else {
        // Si hay más de dos países, unirlos con comas y "and" antes del último
        const allExceptLast = sortedCountries.slice(0, -1).join(', ');
        const lastCountry = sortedCountries[sortedCountries.length - 1];
        return `${allExceptLast} and ${lastCountry}`;
      }
    }

    return '';
  }

  getAuthors(): string {
    // Obtener los autores personales y organizacionales, asegurándose de eliminar cualquier espacio extra al final
    const personalAuthors = this.dataset?.creator_personal?.trim() || ''; // 'trim()' elimina los espacios al principio y al final
    const organizationalAuthors = this.dataset?.creator_organizational?.trim() || ''; // Igual para los autores organizacionales

    // Concatenar los autores personales y organizacionales
    const authors = [personalAuthors, organizationalAuthors]
      .filter(author => author)  // Elimina cualquier autor vacío
      .join('; ');  // Une los autores con un punto y coma y un espacio

    // Devolver el string final, donde se eliminan los espacios incorrectos después del punto y coma, si es necesario
    return authors.replace(/;\s+/g, '; ').trim();  // Asegura que no haya espacios extra al final
  }

  getLicense(): string {
    // Obtener la URL de la licencia desde el JSON
    const licenseUrl = this.dataset?.license || '';  // Si no hay licencia, se usa una cadena vacía

    // Obtener la fecha de emisión (issued) desde el JSON y convertirla a un formato de fecha
    const issuedDate = new Date(this.dataset?.issued || '');
    const cutoffDate = new Date('2022-05-11');  // Fecha de corte: 11 de mayo de 2022

    // Si la fecha de emisión es anterior a la fecha de corte, se asigna la licencia 3.0
    const defaultLicense = issuedDate < cutoffDate
      ? 'https://creativecommons.org/licenses/by/3.0/igo/legalcode'
      : 'https://creativecommons.org/licenses/by/4.0/legalcode';

    const finalLicenseUrl = licenseUrl || defaultLicense;
    return finalLicenseUrl;
  }

  // Método para asegurarse de que keywords sea un array y luego ordenarlos
  getSortedKeywords(): string[] {
    if (Array.isArray(this.dataset?.keyword)) {
      // Si las keywords son un array, limpiamos los espacios antes de ordenar
      return this.dataset?.keyword
        .map((keyword: string) => keyword.trim())  // Eliminar los espacios al inicio y final
        .sort((a: string, b: string) => a.localeCompare(b)); // Ordenar
    }

    if (typeof this.dataset?.keyword === 'string') {
      // Si las keywords son un string, las convertimos en un array
      return this.dataset?.keyword
        .split(',')
        .map((keyword: string) => keyword.trim())  // Limpiar los espacios en blanco
        .sort((a: string, b: string) => a.localeCompare(b));  // Ordenar
    }

    return []; // Si no hay keywords, devolvemos un array vacío
  }

}
